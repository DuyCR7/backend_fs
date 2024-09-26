import db from "../../models/index";
import { Op } from "sequelize";

const createVoucher = async (dataVoucher) => {
    try {
        let voucher = await db.Voucher.findOne({
            where: {
                code: dataVoucher.code
            }
        });

        if (voucher) {
            return {
                EM: "Mã voucher đã tồn tại!",
                EC: 1,
                DT: "code"
            }
        } else {
            await db.Voucher.create(dataVoucher);
            return {
                EM: "Tạo mã voucher thành công!",
                EC: 0,
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

const getVouchersWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { code: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Voucher.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            vouchers: rows,
        }

        return {
            EM: "Lấy thông tin vouchers thành công!",
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

const updateVoucher = async (dataVoucher) => {
    try {
        let voucher = await db.Voucher.findOne({
            where: {
                id: dataVoucher.id
            }
        });

        if(voucher) {
            let checkExistCode = await db.Voucher.findAll({
                where: {
                    code: dataVoucher.code,
                    id: { [Op.not]: dataVoucher.id }
                }
            });
            
            if(checkExistCode.length > 0) {
                return {
                    EM: `Đã tồn tại mã giảm giá có mã code: ${dataVoucher.code}`,
                    EC: 1,
                    DT: "code"
                }
            }

            await voucher.update({
                code: dataVoucher.code,
                discountType: dataVoucher.discountType,
                discountValue: dataVoucher.discountValue,
                maxDiscountAmount: dataVoucher.maxDiscountAmount,
                minOrderValue: dataVoucher.minOrderValue,
                startDate: dataVoucher.startDate,
                endDate: dataVoucher.endDate,
                usageLimit: dataVoucher.usageLimit,
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy code!",
                EC: 1,
                DT: "",
            }
        }
        
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

const setActiveVoucher = async (id) => {
    try {
        let voucher = await db.Voucher.findOne({
            where: {
                id: id
            }
        });

        if(voucher) {
            await voucher.update({
                isActive: !voucher.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy voucher!",
                EC: 1,
                DT: "",
            }
        }
        
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

module.exports = {
    createVoucher,
    getVouchersWithPagination,
    updateVoucher,
    setActiveVoucher,
}