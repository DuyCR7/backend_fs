import db from "../../models/index";
import { Op } from "sequelize";

const addToWishList = async (cusId, productId) => {
    try {
        // let wishList = await db.WishList.findOne({
        //     where: {
        //         customerId: cusId,
        //         productId: productId
        //     }
        // });
        
        // if (wishList) {
        //     return {
        //         EM: "Sản phẩm đã tồn tại trong danh sách yêu thích của bạn!",
        //         EC: 0,
        //         DT: ""
        //     }
        // } else {
            await db.Wish_List.create({
                cusId: cusId,
                productId: productId
            });
            
            let count = await db.Wish_List.count({
                where: {
                    cusId: cusId
                }
            });
            
            return {
                EM: "Thêm sản phẩm vào danh sách yêu thích thành công!",
                EC: 0,
                DT: count
            }
        // }

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
        let count = await db.Wish_List.count({
            where: {
                cusId: cusId
            }
        });
        
        return {
            EM: "",
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

const getWishList = async (cusId) => {
    try {
        let wishList = await db.Wish_List.findAll({
            where: {
                cusId: cusId
            },
            include: [
                {
                    model: db.Product,
                    attributes: ["id", "name", "price", "price_sale", "isSale", "slug"],
                    include: [
                        {
                            model: db.Product_Image,
                            where: { isMainImage: true },
                            attributes: ["image"]
                        },
                        {
                            model: db.Review,
                            attributes: ['rating']
                        }
                    ]
                }
            ]
        });
        
        if(!wishList) {
            return {
                EM: "Danh sách yêu thích của bạn rỗng!",
                EC: 0,
                DT: []
            }
        } else {

            wishList = wishList.map(item => {
                const product = item.Product;

                const ratings = product.Reviews.map(review => review.rating);
                
                const averageRating = ratings.length > 0 
                    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                    : 0;

                return {
                    ...item.toJSON(),  // Chuyển item sang object
                    Product: {
                        ...product.toJSON(),  // Chuyển product sang object
                        averageRating: averageRating
                    }
                };
            });

            return {
                EM: "Lấy danh sách yêu thích thành công!",
                EC: 0,
                DT: wishList
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

const deleteWishListItem = async (cusId, productId) => {
    try {
        await db.Wish_List.destroy({
            where: {
                cusId: cusId,
                productId: productId
            }
        });
        
        let count = await db.Wish_List.count({
            where: {
                cusId: cusId
            }
        });
        
        return {
            EM: "Xóa sản phẩm khỏi danh sách yêu thích thành công!",
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

module.exports = {
    addToWishList,
    getCount,
    getWishList,
    deleteWishListItem,
}