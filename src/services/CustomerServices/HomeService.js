import db from "../../models/index";
import { Op } from "sequelize";

const getAllBanners = async () => {
    try {
        let banners = await db.Banner.findAll({
            where: {
                isActive: true
            },
            order: [[
                'id', 'ASC'
            ]]
        })

        if(banners) {
            return {
                EM: "Lấy thông tin tất cả banner thành công!",
                EC: 0,
                DT: banners
            }
        } else {
            return {
                EM: "Không tìm thấy banner nào!",
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

const getAllTeams = async () => {
    try {
        let teams = await db.Team.findAll({
            where: {
                isActive: true
            },
            order: [[
                'id', 'DESC'
            ]]
        })

        if(teams) {
            return {
                EM: "Lấy thông tin tất cả đội bóng thành công!",
                EC: 0,
                DT: teams
            }
        } else {
            return {
                EM: "Không tìm thấy đội bóng nào!",
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

const getAllParentCategories = async () => {
    try {
        let parent_categories = await db.Category.findAll({
            where: {
                parent_id: 0,
                isActive: true
            },
            order: [[
                'id', 'DESC'
            ]]
        })

        if(parent_categories) {
            return {
                EM: "Lấy thông tin tất cả danh mục cha thành công!",
                EC: 0,
                DT: parent_categories
            }
        } else {
            return {
                EM: "Không tìm thấy danh mục cha nào!",
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

const getNewEvent = async () => {
    try {
        let new_event = await db.Event.findOne({
            where: {
                isActive: true
            },
            order: [[
                'updatedAt', 'DESC'
            ]]
        })

        if(new_event) {
            return {
                EM: "Lấy thông tin sự kiện mới nhất thành công!",
                EC: 0,
                DT: new_event
            }
        } else {
            return {
                EM: "Không tìm thấy sự kiện!",
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

const getAllTrending = async () => {
    try {
        let allTrending = await db.Product.findAll({
            where: {
                isTrending: true,
                isActive: true
            },
            attributes: ['id', 'name', 'price', 'price_sale', 'isSale', 'slug', 'categoryId'],
            include: [
                {
                    model: db.Product_Image,
                    where: { isMainImage: true },
                    attributes: ['id', 'productId', 'image'],
                }
            ]
        });

        if(allTrending && allTrending.length > 0) {
            // Lấy tất cả danh mục liên quan
            const categories = await db.Category.findAll({
                attributes: ['id', 'name', 'parent_id']
            });


            // Hàm đệ quy để tìm danh mục gốc
            const findRootCategory = (categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                if (!category || category.parent_id === 0) {
                    return category;
                }
                return findRootCategory(category.parent_id);
            };

            allTrending = allTrending.map(product => {
                const rootCategory = findRootCategory(product.categoryId);
                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    price_sale: product.price_sale,
                    slug: product.slug,
                    isSale: product.isSale,
                    category: rootCategory ? {
                        id: rootCategory.id,
                        name: rootCategory.name
                    } : null,
                    image: product.Product_Images[0]?.image
                };
            });

            return {
                EM: "Lấy thông tin tất cả sản phẩm trending thành công!",
                EC: 0,
                DT: allTrending
            }
        } else {
            return {
                EM: "Không tìm thấy sản phẩm trending nào!",
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

const getSearchProducts = async (search) => {
    try {
        let products = await db.Product.findAll({
            where: {
                isActive: true,
                name: { [Op.like]: `%${search}%` },
                
            },
            include: [
                {
                    model: db.Product_Image,
                    where: { isMainImage: true },
                    attributes: ['image'],
                }
            ],
            order: [[
                'id', 'DESC'
            ]]
        })

        if(products.length > 0) {
            return {
                EM: "Lấy thông tin tất cả sản phẩm thành công!",
                EC: 0,
                DT: products
            }
        } else {
            return {
                EM: "Không tìm thấy sản phẩm nào!",
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

module.exports = {
    getAllBanners,
    getAllTeams,
    getAllParentCategories,
    getNewEvent,
    getAllTrending,
    getSearchProducts
}