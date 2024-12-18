import db from "../../models/index";
import { Op, fn, col, literal } from "sequelize";
import { io } from "../../server";

const getCustomersWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ],
        };

        const { count, rows } = await db.Customer.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
            include: [
                {
                    model: db.Order,
                    attributes: [],
                    required: false //left outer join
                }
            ],
            attributes: [
                'id',
                'email',
                'phone',
                'fullname',
                'username',
                'isActive',
                'verified',
                [fn('COUNT', literal('CASE WHEN Orders.status = 4 THEN 1 ELSE NULL END')), 'successfulOrderCount'],
                [fn('COUNT', literal('CASE WHEN Orders.status = 0 THEN 1 ELSE NULL END')), 'cancelledOrderCount']
            ],
            group: ['Customer.id'],
            subQuery: false
        });

        let data = {
            totalRows: count.length,
            currentPage: page,
            totalPages: Math.ceil(count.length / limit),
            customers: rows,
        }

        return {
            EM: "Lấy thông tin khách hàng thành công!",
            EC: 0,
            DT: data
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const lockCustomer = async (cusId) => {
    try {
        const customer = await db.Customer.update({
            isActive: false,
        }, {
            where: {
                id: cusId,
            }
        });

        if (customer) {
            io.emit('lockCustomer', { cusId });
            return {
                EM: "Khóa khách hàng thành công!",
                EC: 0,
                DT: ""
            }
        } else {
            return {
                EM: "Không tìm thấy khách hàng nào phù hợp!",
                EC: -1,
                DT: ""
            }
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const unLockCustomer = async (cusId) => {
    try {
        const customer = await db.Customer.update({
            isActive: true,
        }, {
            where: {
                id: cusId,
            }
        });

        if (customer) {
            return {
                EM: "Mở khóa tài khoản khách hàng thành công!",
                EC: 0,
                DT: ""
            }
        } else {
            return {
                EM: "Không tìm thấy khách hàng nào phù hợp!",
                EC: -1,
                DT: ""
            }
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

module.exports = {
    getCustomersWithPagination,
    lockCustomer,
    unLockCustomer,
}