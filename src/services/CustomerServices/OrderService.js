import db from "../../models/index";
import { Op } from "sequelize";

const getMyOrders = async (cusId) => {
    try {
        const customer = await db.Customer.findByPk(cusId);
        if (!customer) {
            return {
                EM: "Không tìm thấy khách hàng!",
                EC: 1,
                DT: ""
            };
        }

        const orders = await db.Order.findAll({
            where: {
                cusId: cusId,
            },
            order: [
                ['id', 'DESC']
            ],
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
            ]
        });

        return {
            EM: `Lấy danh sách tất cả các đơn hàng của khách hàng ${customer.email} thành công!`,
            EC: 0,
            DT: orders
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
    getMyOrders,
}