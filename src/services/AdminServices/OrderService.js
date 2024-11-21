import db from "../../models/index";
import { Op } from "sequelize";

const getOrdersWithPagination = async (page, limit, search, sortConfig, statuses) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { id: { [Op.like]: `%${search}%` } },
                { addPhone: { [Op.like]: `%${search}%` } }
            ]
        };

        if (statuses && statuses.length > 0) {
            whereClause.status = {
                [Op.in]: statuses
            };
        }

        const [totalCount, orders] = await Promise.all([
            db.Order.count({
                where: whereClause,
            }),
            db.Order.findAll({
                where: whereClause,
                order: order,
                include: [
                    {
                        model: db.Order_Detail,
                        include: [
                            {
                                model: db.Product_Detail,
                                include: [
                                    {
                                        model: db.Product,
                                        attributes: ['id', 'name', 'price', 'price_sale', 'isSale', 'slug'],
                                    },
                                    {
                                        model: db.Color,
                                        attributes: ['id', 'name']
                                    },
                                    {
                                        model: db.Size,
                                        attributes: ['id', 'code']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: db.Voucher,
                        attributes: ['code']
                    }
                ],
                offset: offset,
                limit: limit,
            })
        ]);

        let data = {
            totalRows: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            orders: orders,
        }

        return {
            EM: "Lấy thông tin đơn hàng thành công!",
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

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        console.log(newStatus);
        const order = await db.Order.findByPk(orderId);
        if (!order) {
            return {
                EM: "Không tìm thấy đơn hàng!",
                EC: 1,
                DT: ""
            };
        }

        if (![0, 1, 2, 3, 4].includes(newStatus)) {
            return {
                EM: "Trạng thái không hợp lệ!",
                EC: 1,
                DT: ""
            };
        }
        
        if (order.status === 0) {
            return {
                EM: "Đơn hàng đã bị hủy! Nhấn Làm mới để cập nhật",
                EC: 1,
                DT: ""
            };
        }

        if (newStatus <= order.status) {
            return {
                EM: "Không thể chuyển về trạng thái trước đó!",
                EC: 1,
                DT: ""
            };
        }

        order.status = newStatus;
        await order.save();

        return {
            EM: "Cập nhật trạng thái đơn hàng thành công!",
            EC: 0,
            DT: order
        };
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
    getOrdersWithPagination,
    updateOrderStatus,
}