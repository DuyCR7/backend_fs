import db from "../../models/index";
import { Sequelize, Op } from "sequelize";

const getAllInforProduct = async (page, limit, filterTeam, filterCategory, filterSize, filterColor, sortOption) => {
    // try {
    //     let productDetailWhere = {};
    //     if (filterSize.length > 0 || filterColor.length > 0) {
    //         productDetailWhere = {
    //             // [Op.or]: [
    //             //     filterSize.length > 0 ? { sizeId: { [Op.in]: filterSize } } : null,
    //             //     filterColor.length > 0 ? { colorId: { [Op.in]: filterColor } } : null
    //             // ].filter(Boolean) // Loại bỏ các điều kiện null
    //             ...(filterSize.length > 0 && { sizeId: { [Op.in]: filterSize } }),
    //             ...(filterColor.length > 0 && { colorId: { [Op.in]: filterColor } })
    //         };
    //     }

    //     const { count, rows } = await db.Product.findAndCountAll({
    //         where: {isActive: true},
    //         limit: limit,
    //         offset: (page - 1) * limit,
    //         order: [['id', 'DESC']],
    //         include: [
    //             {
    //                 model: db.Category,
    //                 attributes: ['id', 'name'],
    //                 where: filterCategory.length > 0 ? { id: { [Op.in]: filterCategory } } : {}
    //             },
    //             {
    //                 model: db.Team,
    //                 attributes: ['id', 'name'],
    //                 where: filterTeam.length > 0 ? { id: { [Op.in]: filterTeam } } : {},
    //             },
    //             {
    //                 model: db.Product_Image,
    //                 attributes: ['id', 'image'],
    //                 where: { isMainImage: true },
    //             },
    //             {
    //                 model: db.Product_Detail,
    //                 attributes: ['sizeId', 'colorId'],
    //                 where: productDetailWhere,
    //                 separate: (filterSize.length > 0 || filterColor.length > 0) ? false : true,
    //                 required: true,
    //                 // separate: false,
    //                 // required: true,
    //             },
    //         ],
    //     });

    //     // Lấy tất cả Product_Detail cho các sản phẩm đã lấy
    //     const allProductDetails = await db.Product_Detail.findAll({
    //         where: { productId: rows.map(product => product.id) },
    //         attributes: ['productId', 'sizeId', 'colorId'],
    //     });

    //     let data = {
    //         currentPage: page,
    //         totalPages: Math.ceil(count / limit),
    //         totalRows: count,
    //         products: {
    //             data: rows,
    //             productDetails: allProductDetails,
    //         },
    //     }

    //     return {
    //         EM: 'Lấy sản phẩm thành công!',
    //         EC: 0,
    //         DT: data
    //     };


    // } catch (e) {
    //     console.log(e);
    //     return {
    //         EM: "Lỗi, vui lòng thử lại sau!",
    //         EC: -1,
    //         DT: ""
    //     }
    // }

    try {
        // Xây dựng điều kiện where cho sản phẩm
        let productWhere = { isActive: true };
        if (filterTeam.length > 0) {
            productWhere.teamId = { [Op.in]: filterTeam };
        }
        if (filterCategory.length > 0) {
            productWhere.categoryId = { [Op.in]: filterCategory };
        }

        // Xây dựng điều kiện where cho product details
        let productDetailWhere = {};
        if (filterSize.length > 0) {
            productDetailWhere.sizeId = { [Op.in]: filterSize };
        }
        if (filterColor.length > 0) {
            productDetailWhere.colorId = { [Op.in]: filterColor };
        }

        // Lấy danh sách ID sản phẩm thỏa mãn điều kiện
        const productIds = await db.Product_Detail.findAll({
            attributes: ['productId'],
            where: productDetailWhere,
            group: ['productId'],
            raw: true
        }).then(results => results.map(result => result.productId));

        if (productIds.length > 0) {
            productWhere.id = { [Op.in]: productIds };
        }

        // Đếm tổng số sản phẩm
        const totalCount = await db.Product.count({ where: productWhere });

        let order = [['id', 'DESC']];  // Mặc định sắp xếp theo id giảm dần
        switch(sortOption) {
            case 'price-asc':
                order = [['price', 'ASC']];
                break;
            case 'price-desc':
                order = [['price', 'DESC']];
                break;
            case 'name-asc':
                order = [['name', 'ASC']];
                break;
            case 'name-desc':
                order = [['name', 'DESC']];
                break;
        }

        // Lấy danh sách sản phẩm với phân trang và sắp xếp
        const products = await db.Product.findAll({
            where: productWhere,
            limit: limit,
            offset: (page - 1) * limit,
            order: order,
            include: [
                {
                    model: db.Category,
                    attributes: ['id', 'name'],
                },
                {
                    model: db.Team,
                    attributes: ['id', 'name'],
                },
                {
                    model: db.Product_Image,
                    attributes: ['id', 'image'],
                    where: { isMainImage: true },
                },
                // {
                //     model: db.Product_Detail,
                //     attributes: ['sizeId', 'colorId'],
                //     where: productDetailWhere,
                //     required: false,
                // },
            ],
        });

        // Lấy tất cả Product_Detail cho các sản phẩm đã lấy
        const allProductDetails = await db.Product_Detail.findAll({
            where: { 
                productId: products.map(product => product.id),
                ...productDetailWhere
            },
            attributes: ['productId', 'sizeId', 'colorId'],
        });

        let data = {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalRows: totalCount,
            products: {
                data: products,
                productDetails: allProductDetails,
            },
        }

        return {
            EM: 'Lấy sản phẩm thành công!',
            EC: 0,
            DT: data
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

const getCategories = async (filterTeam, filterSize, filterColor) => {
    try {
        // const categoryIds = products.data.map(product => product.categoryId);
        // const distinctCategories = await db.Category.findAll({
        //     where: {
        //         id: categoryIds,
        //     },
        // });
        
        // return distinctCategories;

        const categories = await db.Category.findAll({
            order: [['id', 'DESC']],
            include: [
                {
                    model: db.Product,
                    attributes: ['id'],
                    where: {
                        ...(filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
                        ...(filterSize.length > 0 && {
                            id: {
                                [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE sizeId IN (${filterSize.join(',')}))
                                `),
                            },
                        }),
                        ...(filterColor.length > 0 && {
                            id: {
                                [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE colorId IN (${filterColor.join(',')}))
                                `),
                            },
                        }),
                    },
                },
            ],
        });
        return categories;
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getTeams = async (filterCategory, filterSize, filterColor) => {
    try {
        const teams = await db.Team.findAll({
            order: [['id', 'DESC']],
            include: [
                {
                    model: db.Product,
                    attributes: ['id'],
                    where: {
                        ...(filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                        ...(filterSize.length > 0 && {
                            id: {
                                [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE sizeId IN (${filterSize.join(',')}))
                                `),
                            },
                        }),
                        ...(filterColor.length > 0 && {
                            id: {
                                [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE colorId IN (${filterColor.join(',')}))
                                `),
                            },
                        }),
                    },
                },
            ],
        });
        return teams;
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getSizes = async (filterCategory, filterTeam, filterColor) => {
    try {
        const sizes = await db.Size.findAll({
            order: [['id', 'DESC']],
            include: [
                {
                    model: db.Product_Detail,
                    attributes: ['id'],
                    required: true,
                    include: [
                        {
                            model: db.Product,
                            attributes: ['id'],
                            where: {
                                ...(filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
                                ...(filterColor.length > 0 && { id: { [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE colorId IN (${filterColor.join(',')}))
                                `)} }),
                            },
                        },
                    ],
                },
            ],
        });
        return sizes;
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getColors = async (filterCategory, filterTeam, filterSize) => {
    try {
        const colors = await db.Color.findAll({
            order: [['id', 'DESC']],
            include: [
                {
                    model: db.Product_Detail,
                    attributes: ['id'],
                    required: true,
                    include: [
                        {
                            model: db.Product,
                            attributes: ['id'],
                            where: {
                                ...(filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
                                ...(filterSize.length > 0 && { id: { [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE sizeId IN (${filterSize.join(',')}))
                                `)} }),
                            },
                        },
                    ],
                },
            ],
        });
        return colors;
    } catch (e) {
        console.log(e);
        return [];
    }
};

module.exports = {
    getAllInforProduct,
    getCategories,
    getTeams,
    getSizes,
    getColors,
}