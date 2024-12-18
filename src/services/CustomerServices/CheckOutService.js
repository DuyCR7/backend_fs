import db from "../../models/index";
import { Op } from "sequelize";
import { io } from "../../server";
import sendEmail from "../../utils/sendEmail";

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

const deleteAddress = async (cusId, addressId) => {
    try {
        let address = await db.Cus_Address.findOne({
            where: {
                id: addressId,
                cusId: cusId
            }
        });

        if (address) {
            await address.destroy();
            return {
                EM: "Xóa địa chỉ thành công!",
                EC: 0,
                DT: ""
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

const getMyVoucher = async (cusId) => {
    try {
        const vouchers = await db.Voucher.findAll({
            where: {
                isActive: true,
                startDate: {
                    [Op.lt]: new Date()
                },
                endDate: {
                    [Op.gt]: new Date()
                },
                usageLimit: {
                    [Op.gt]: db.Sequelize.col('usedCount')
                }
            },
            include: [
                {
                    model: db.Voucher_Customer,
                    where: {
                        cusId: cusId,
                        isUsed: false
                    }
                }
            ]
        });

        return {
            EM: "Lấy voucher thành công!",
            EC: 0,
            DT: vouchers
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

const generateOrderConfirmationEmail = (customer, order, orderDetails) => {
    const formatPrice = (price) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    let emailContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đơn hàng</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Xác nhận đơn hàng</h1>
            </div>
            <div class="content">
                <p>Xin chào ${customer.email},</p>
                <p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi. Dưới đây là chi tiết đơn hàng của bạn:</p>
                
                <table>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <td>${order.id}</td>
                    </tr>
                    <tr>
                        <th>Ngày đặt hàng</th>
                        <td>${new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                    <tr>
                        <th>Phương thức thanh toán</th>
                        <td>${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'PayPal'}</td>
                    </tr>
                    <tr>
                        <th>Phương thức vận chuyển</th>
                        <td>${order.shippingMethod === 'standard' ? `Tiêu chuẩn - ${formatPrice(20000)}` : `Nhanh - ${formatPrice(50000)}`}</td>
                    </tr>
                    ${
                        order.voucherId ? `
                        <tr>
                            <th>Giảm giá</th>
                            <td>${formatPrice(order.appliedDiscount)}</td>
                        </tr>
                        ` : ''
                    }
                    <tr>
                        <th>Tổng giá trị đơn hàng</th>
                        <td>${formatPrice(order.totalPrice)}</td>
                    </tr>
                </table>

                <h2>Chi tiết sản phẩm</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetails.map(detail => `
                            <tr>
                                <td>${detail.name} (${detail.color}, ${detail.size})</td>
                                <td>${detail.quantity}</td>
                                <td>${formatPrice(detail.price)}</td>
                                <td>${formatPrice(detail.price * detail.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi.</p>
                <p>Trân trọng,<br>Đội ngũ cửa hàng</p>
            </div>
            <div class="footer">
                <p>© 2024 Seven Shop</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailContent;
};

const createOrder = async (cusId, paymentMethod, shippingMethod, totalPrice, addLocation, addName, addPhone, addEmail, note, orderDetails, paypalOrderId, voucherId, appliedDiscount) => {
    const t = await db.sequelize.transaction();
    
    try {
        if (voucherId) {
            const voucher = await db.Voucher.findByPk(voucherId, { transaction: t });
            if (!voucher || !voucher.isActive || voucher.usedCount >= voucher.usageLimit || new Date() > new Date(voucher.endDate)) {
                await t.rollback();
                return {
                    EM: "Mã giảm giá không hợp lệ hoặc đã hết hạn!",
                    EC: 1,
                    DT: ""
                };
            }

            voucher.usedCount++;
            await voucher.save({ transaction: t });
            await db.Voucher_Customer.update({
                isUsed: true,
                usedDate: new Date()
            }, {
                where: {
                    cusId: cusId,
                    voucherId: voucherId
                },
                transaction: t
            })
        }

        const newOrder = await db.Order.create({
            cusId: cusId,
            paymentMethod: paymentMethod,
            shippingMethod: shippingMethod,
            totalPrice: totalPrice,
            addLocation: addLocation,
            addName: addName,
            addPhone: addPhone,
            addEmail: addEmail,
            status: paymentMethod === 'cod' ? 1 : 2,
            note: note,
            paypalOrderId: paypalOrderId,
            voucherId: voucherId,
            appliedDiscount: appliedDiscount
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
                    EM: productDetail.quantity === 0 ? 
                        `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} đã hết hàng!`
                        :
                        `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} chỉ còn ${productDetail.quantity} sản phẩm sẵn có!`,
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

        const customer = await db.Customer.findByPk(cusId);

        if (customer.email) {
            const orderConfirmationEmail = generateOrderConfirmationEmail(customer, newOrder, orderDetails);
            await sendEmail(customer.email, "Thông Tin Đơn Hàng", orderConfirmationEmail);
        }

        return {
            EM: customer.email ? "Đặt hàng thành công! Một email xác nhận đã được gửi đến địa chỉ email của bạn." : "Đặt hàng thành công!",
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
    deleteAddress,
    getMyVoucher,
    createOrder,
}