import db from "../../models/index";
import { Op } from "sequelize";
import { io } from "../../server";

const getAddress = async (cusId) => {
    try {
        let addresses = await db.Cus_Address.findAll({
            where: {
                cusId: cusId
            },
            order: [
                ['isDefault', 'DESC'],
                ['id', 'DESC']
            ]
        });

        if (addresses) {
            return {
                EM: "Lấy thông tin địa chỉ thành công!",
                EC: 0,
                DT: addresses
            }
        } else {
            return {
                EM: "Không tìm thấy địa chỉ nào!",
                EC: -1,
                DT: []
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

const addNewAddress = async (dataAddress) => {
    try {
        let checkEmailPhone = await db.Cus_Address.findOne({
            where: {
                [Op.or]: [
                    { email: dataAddress.email },
                    { phone: dataAddress.phone }
                ],
                cusId: { [Op.not]: dataAddress.cusId }
            }
        });

        if (checkEmailPhone) {
            return {
                EM: "Email hoặc số điện thoại đã tồn tại!",
                EC: 1,
                DT: ""
            }
        }

        let address = await db.Cus_Address.findOne({
            where: {
                [Op.and]: [
                    { name: dataAddress.name }, 
                    { address: dataAddress.address },
                    { phone: dataAddress.phone },
                    { email: dataAddress.email },
                ],
                cusId: dataAddress.cusId
            }
        });

        if (address) {
            return {
                EM: "Thông tin địa chỉ đã tồn tại!",
                EC: 1,
                DT: ""
            }
        } else {
            if (dataAddress.isDefault) {
                await db.Cus_Address.update({ isDefault: false }, { where: { cusId: dataAddress.cusId } });
            }

            await db.Cus_Address.create(dataAddress);
            return {
                EM: "Thêm mới địa chỉ thành công!",
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

const updateAddress = async (dataAddress) => {
    console.log("dataAddress", dataAddress.isDefault);
    try {
        let address = await db.Cus_Address.findOne({
            where: {
                id: dataAddress.id,
                cusId: dataAddress.cusId
            }
        });

        if (address) {
            let checkEmailPhone = await db.Cus_Address.findOne({
                where: {
                    [Op.or]: [
                        { email: dataAddress.email },
                        { phone: dataAddress.phone }
                    ],
                    id: { [Op.not]: dataAddress.id },
                    cusId: { [Op.not]: dataAddress.cusId }
                }
            });

            if (checkEmailPhone) {
                return {
                    EM: "Email hoặc số điện thoại đã tồn tại!",
                    EC: 1,
                    DT: ""
                }
            }

            let checkExists = await db.Cus_Address.findAll({
                where: {
                    [Op.and]: [
                        { name: dataAddress.name }, 
                        { address: dataAddress.address },
                        { phone: dataAddress.phone },
                        { email: dataAddress.email },
                        { id: { [Op.not]: dataAddress.id } }
                    ],
                    cusId: dataAddress.cusId
                }
            });

            if (checkExists.length > 0) {
                return {
                    EM: "Thông tin địa chỉ đã tồn tại!",
                    EC: 1,
                    DT: ""
                }
            } else {
                if (dataAddress.isDefault) {
                    await db.Cus_Address.update({ isDefault: false }, {
                        where: { 
                            id: { [Op.ne]: dataAddress.id },
                            cusId: dataAddress.cusId
                        }
                    });
                }

                await address.update(dataAddress);
                return {
                    EM: "Cập nhật địa chỉ thành công!",
                    EC: 0,
                    DT: ""
                }
            }
        } else {
            return {
                EM: "Địa chỉ không tồn tại!",
                EC: 1,
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

const createOrder = async (cusId, paymentMethod, shippingMethod, totalPrice, cusAddressId, orderDetails, paypalOrderId) => {
    const t = await db.sequelize.transaction();
    
    try {
        const newOrder = await db.Order.create({
            cusId: cusId,
            paymentMethod: paymentMethod,
            shippingMethod: shippingMethod,
            totalPrice: totalPrice,
            cusAddressId: cusAddressId,
            status: 1,
            paypalOrderId: paypalOrderId
        }, {
            transaction: t
        });

        const cart = await db.Cart.findOne({
            where: { cusId: cusId },
            transaction: t
        });

        if (!cart) {
            await t.rollback();
            return {
                EM: "Không tìm thấy giỏ hàng!",
                EC: 1,
                DT: ""
            };
        }

        for (const detail of orderDetails) {
            const productDetail = await db.Product_Detail.findByPk(detail.productDetailId, 
                { 
                    transaction: t,
                    lock: true,
                    include: [
                        { 
                            model: db.Product,
                            attributes: ['id', 'name']
                        },
                        { 
                            model: db.Color,
                            attributes: ['id', 'name']
                        },
                        { 
                            model: db.Size,
                            attributes: ['id', 'code']
                        },
                    ]
                }
            );

            if (!productDetail) {
                await t.rollback();
                return {
                    EM: "Sản phẩm không tồn tại!",
                    EC: 1,
                    DT: ""
                };
            }

            if (productDetail.quantity < detail.quantity) {
                await t.rollback();
                return {
                    EM: `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} chỉ còn ${productDetail.quantity} sản phẩm sẵn có!`,
                    EC: 1,
                    DT: ""
                };
            }

            await Promise.all([
                db.Order_Detail.create({
                    orderId: newOrder.id,
                    productDetailId: detail.productDetailId,
                    quantity: detail.quantity,
                    price: detail.price,
                }, {
                    transaction: t
                }),
                productDetail.decrement('quantity', { by: detail.quantity, transaction: t }),
                db.Cart_Detail.destroy({
                    where: {
                        cartId: cart.id,
                        productDetailId: detail.productDetailId
                    },
                    transaction: t
                })
            ]);

            // io.emit('productQuantityUpdated', {
            //     productId: productDetail.Product.id,
            //     productDetailId: productDetail.id,
            //     newQuantity: productDetail.quantity - detail.quantity
            // });
        }

        const remainingCartItems = await db.Cart_Detail.count({
            where: { cartId: cart.id },
            transaction: t
        });

        if (remainingCartItems === 0) {
            await db.Cart.destroy({
                where: { id: cart.id },
                transaction: t
            });
        }

        await t.commit();

        return {
            EM: "Đặt hàng thành công!",
            EC: 0,
            DT: {
                orderId: newOrder.id,
                orderDetails: orderDetails,
                remainingCartItems: remainingCartItems
            }
        }

    } catch (e) {
        console.log(e);
        await t.rollback();
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

module.exports = {
    getAddress,
    addNewAddress,
    updateAddress,
    createOrder,
}