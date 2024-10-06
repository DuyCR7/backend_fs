import db from "../../models/index";
import { Op } from "sequelize";

const addToCart = async (cusId, productId, productDetailId, quantity) => {
    try {
        const productDetail = await db.Product_Detail.findByPk(productDetailId, {
            include: [
                { model: db.Color },
                { model: db.Size },
                { model: db.Product, attributes: ['name'] }
            ]
        });
        if (!productDetail || productDetail.quantity < quantity) {
            return {
                EM: productDetail.quantity === 0 ?
                    `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} đã hết hàng!`
                    :
                    `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} chỉ còn ${productDetail.quantity} sản phẩm sẵn có!`,
                EC: 1,
                DT: ""
            }
        }

        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });

        if (!cart) {
            cart = await db.Cart.create({
                cusId: cusId,
            });
        }

        let cartDetail = await db.Cart_Detail.findOne({
            where: {
                cartId: cart.id,
                productId: productId,
                productDetailId: productDetailId,
            }
        });

        if (!cartDetail) {
            cartDetail = await db.Cart_Detail.create({
                cartId: cart.id,
                productId: productId,
                productDetailId: productDetailId,
                quantity: quantity,
            });
        } else {
            if (cartDetail.quantity + quantity > productDetail.quantity) {
                return {
                    EM: productDetail.quantity - cartDetail.quantity > 0 ? 
                        `Hiện trong giỏ hàng đã có ${cartDetail.quantity} sản phẩm loại này! Chỉ có thể thêm tối đa ${productDetail.quantity - cartDetail.quantity} sản phẩm`
                        :
                        `Hiện trong giỏ hàng đã có cả ${cartDetail.quantity} sản phẩm loại này!`,
                    EC: 1,
                    DT: ""
                }
            }

            cartDetail.quantity += quantity;
            await cartDetail.save();
        }

        let count = await db.Cart_Detail.count({
            where: {
                cartId: cart.id,
            }
        });

        return {
            EM: "Thêm vào giỏ hàng thành công!",
            EC: 0,
            DT: count
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

const getCount = async (cusId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });

        if (!cart) {
            return {
                EM: "Số lượng sản phầm trong giỏ hàng là 0!",
                EC: 1,
                DT: 0,
            };
        } else {
            let count = await db.Cart_Detail.count({
                where: {
                    cartId: cart.id,
                }
            });

            return {
                EM: `Số lượng sản phầm trong giỏ hàng là ${count}!`,
                EC: 0,
                DT: count,
            };
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

const getCart = async (cusId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });
        if (!cart) {
            return {
                EM: "Giỏ hàng của bạn chưa có sản phẩm nào!",
                EC: 1,
                DT: [],
            }
        } else {
            const [totalItems, cartDetails] = await Promise.all([
                db.Cart_Detail.count({
                    where: {
                        cartId: cart.id,
                    }
                }),
                db.Cart_Detail.findAll({
                    where: {
                        cartId: cart.id,
                    },
                    include: [
                        { 
                            model: db.Product_Detail, 
                            include: [
                                { 
                                    model: db.Product, 
                                    attributes: ['name', 'price', 'price_sale', 'isSale', 'slug'] 
                                },
                                {
                                    model: db.Color, 
                                    attributes: ['name']
                                },
                                { 
                                    model: db.Size, 
                                    attributes: ['code']
                                }
                            ] 
                        },
                    ]
                })
            ]);

            return {
                EM: "Lấy danh sách giỏ hàng thành công!",
                EC: 0,
                DT: {
                    cartDetails: cartDetails,
                    totalItems: totalItems
                },
            };
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

const updateCartItemQuantity = async (cusId, cartDetailId, newQuantity) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });
        if (!cart) {
            return {
                EM: "Không tìm thấy giỏ hàng của bạn!",
                EC: 1,
                DT: ""
            }
        }

        let cartItem = await db.Cart_Detail.findOne({
            where: {
                cartId: cart.id,
                id: cartDetailId,
            },
            include: [
                { model: db.Product_Detail },
            ]
        });

        if (!cartItem) {
            return {
                EM: "Không tìm thấy sản phẩm trong giỏ hàng!",
                EC: 1,
                DT: ""
            }
        }

        let productDetail = cartItem.Product_Detail;

        if (productDetail.quantity === 0) {
            await cartItem.destroy();
            return {
                EM: "Sản phẩm đã hết hàng và bị xóa khỏi giỏ hàng!",
                EC: 2,
                DT: null
            }
        }

        if (newQuantity > productDetail.quantity) {
            newQuantity = productDetail.quantity;
            cartItem.quantity = newQuantity;
            await cartItem.save();

            return {
                EM: productDetail.quantity === 0 ?
                    `Hiện sản phẩm này đã hết hàng!`
                    :
                    `Hiện sản phẩm này chỉ có ${productDetail.quantity} sản phẩm sẵn có!`,
                EC: 3,
                DT: cartItem
            }
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        return {
            EM: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công!",
            EC: 0,
            DT: cartItem,
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

const deleteCartItem = async (cusId, cartDetailId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });
        if (!cart) {
            return {
                EM: "Không tìm thấy giỏ hàng của bạn!",
                EC: 1,
                DT: ""
            }
        }

        let cartItem = await db.Cart_Detail.findOne({
            where: {
                cartId: cart.id,
                id: cartDetailId,
            },
            include: [
                { model: db.Product_Detail },
            ]
        });

        if (!cartItem) {
            return {
                EM: "Không tìm thấy sản phẩm trong giỏ hàng!",
                EC: 1,
                DT: ""
            }
        }

        const cartId = cartItem.cartId;

        await cartItem.destroy();

        let count = await db.Cart_Detail.count({
            where: {
                cartId: cartId,
            }
        });

        return {
            EM: "Xóa sản phẩm khỏi giỏ hàng thành công!",
            EC: 0,
            DT: { 
                id: cartDetailId,
                count: count,
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

const getRelatedProducts = async (cusId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });
        if (!cart) {
            return {
                EM: "Không tìm thấy giỏ hàng của bạn!",
                EC: 1,
                DT: ""
            }
        }

        let cartItems = await db.Cart_Detail.findAll({
            where: {
                cartId: cart.id,
            },
        });

        if (!cartItems) {
            return {
                EM: "Không tìm thấy sản phẩm trong giỏ hàng!",
                EC: 1,
                DT: ""
            }
        }

        const cartProductIds = cartItems.map(item => item.productId);

        const cartCategories = await db.Category.findAll({
            include: [
                {
                    model: db.Product,
                    where: {
                        id: cartProductIds,
                    },
                }
            ]
        });

        const categoryIds = cartCategories.map(category => category.id);

        let relatedProducts = await db.Product.findAll({
            include: [
                {
                    model: db.Category,
                    where: { id: { [Op.in]: categoryIds } }
                },
                {
                    model: db.Product_Image,
                    where: { isMainImage: true },
                    attributes: ['image']
                },
                {
                    model: db.Product_Detail,
                    attributes: ['id', 'sizeId', 'colorId', 'quantity', 'image'],
                    include: [
                        {
                            model: db.Size,
                            attributes: ['id', 'code']
                        },
                        {
                            model: db.Color,
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: db.Review,
                    attributes: ['rating']
                }
            ],
            where: {
              id: { [Op.notIn]: cartProductIds }
            },
            limit: 8
        });

        if (relatedProducts.length === 0) {
            return {
                EM: "Không có sản phẩm liên quan!",
                EC: 0,
                DT: relatedProducts,
            }
        }

        relatedProducts = relatedProducts.map(product => {
            
            const ratings = product.Reviews.map(review => review.rating);
            const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                price_sale: product.price_sale,
                slug: product.slug,
                isSale: product.isSale,
                category: product.Category,
                image: product.Product_Images[0]?.image,
                averageRating: parseFloat(averageRating.toFixed(1)),
                details: product.Product_Details.map(detail => ({
                    id: detail.id,
                    size: {
                        id: detail.Size.id,
                        code: detail.Size.code
                    },
                    color: {
                        id: detail.Color.id,
                        name: detail.Color.name
                    },
                    quantity: detail.quantity,
                    image: detail.image
                }))
            };
        })

        return {
            EM: "Lấy danh sách sản phẩm liên quan thành công!",
            EC: 0,
            DT: relatedProducts,
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
    addToCart,
    getCount,
    getCart,
    updateCartItemQuantity,
    deleteCartItem,
    getRelatedProducts,
}