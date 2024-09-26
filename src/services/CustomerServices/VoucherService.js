import db from "../../models/index";
import { Op } from "sequelize";

const getAllVouchers = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;

        const { count, rows } = await db.Voucher.findAndCountAll({
            where: {
                isActive: true,
                endDate: {
                    [Op.gt]: new Date()
                },
                usageLimit: {
                    [Op.gt]: db.Sequelize.col('usedCount')
                }
            },
            order: [['id', 'DESC']],
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

module.exports = {
    getAllVouchers,
}