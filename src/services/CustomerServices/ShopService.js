import db from "../../models/index";
import { Sequelize, Op } from "sequelize";

const getSubCategories = async (parentId) => {
    const subCategories = await db.Category.findAll({
        where: { parent_id: parentId }
    });
    
    const nestedSubCategories = await Promise.all(
        subCategories.map(async (subCat) => {
            const nested = await getSubCategories(subCat.id);
            return [subCat, ...nested];
        })
    );

    return nestedSubCategories.flat();
}

const getAllInforProduct = async (page, limit, filterTeam, filterCategory, filterSize, filterColor, sortOption, team, category) => {
    try {
        // Xây dựng điều kiện where cho sản phẩm
        let productWhere = { isActive: true };
        // let teamId = null;
        let teamIds = [];
        let categoryIds = [];

        if (team) {
            if (team === 'cau-lac-bo' || team === 'doi-tuyen-quoc-gia') {
                const teamData = await db.Team.findAll({ where: { type: team } });
                if (teamData && teamData.length > 0) {
                    teamIds = teamData.map(team => team.id);

                    if (filterTeam.length > 0) {
                        productWhere.teamId = {
                            [Op.and]: [
                                { [Op.in]: teamIds },
                                { [Op.in]: filterTeam }
                            ]
                        };
                    } else {
                        productWhere.teamId = { [Op.in]: teamIds };
                    }
                } else {
                    return {
                        EM: `Không tìm thấy dữ liệu cho ${team === 'cau-lac-bo' ? 'câu lạc bộ' : 'đội tuyển quốc gia'}!`,
                        EC: -1,
                        DT: "",
                    };
                }
            } else {
                const teamData = await db.Team.findOne({ where: { slug: team } });
                if (teamData) {
                    teamIds = [teamData.id];
                    productWhere.teamId = { [Op.in]: teamIds };
                } else {
                    return {
                        EM: "Đội bóng không tồn tại!",
                        EC: -1,
                        DT: "",
                    };
                }
            }
        }
        else if (filterTeam.length > 0) {
            productWhere.teamId = { [Op.in]: filterTeam };
        }

        if (category) {
            const categoryData = await db.Category.findOne({ where: { slug: category } });
            if (categoryData) {
                const subCategories = await getSubCategories(categoryData.id);
                if (subCategories.length > 0) {
                    categoryIds = subCategories.map(cat => cat.id);
                    productWhere.categoryId = { [Op.in]: categoryIds };
                } else {
                    categoryIds = [categoryData.id];
                    productWhere.categoryId = { [Op.in]: categoryIds };
                }
            
            } else {
                return {
                    EM: "Danh mục không tồn tại!",
                    EC: -1,
                    DT: "",
                };
            }
        }
        else if (filterCategory.length > 0) {
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
        let products = await db.Product.findAll({
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
                }
            ],
        });

        if(products && products.length > 0) {
            products = products.map(product => {
                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    price_sale: product.price_sale,
                    isActive: product.isActive,
                    slug: product.slug,
                    Category: product.Category,
                    Team: product.Team,
                    image: product.Product_Images[0]?.image,
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
                }
            })
        }

        // Lấy tất cả Product_Detail cho các sản phẩm đã lấy
        // const allProductDetails = await db.Product_Detail.findAll({
        //     where: { 
        //         productId: products.map(product => product.id),
        //         ...productDetailWhere
        //     },
        //     attributes: ['productId', 'sizeId', 'colorId'],
        // });

        let data = {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalRows: totalCount,
            products: {
                data: products,
                // productDetails: allProductDetails,
            },
        }
        
        return {
            EM: 'Lấy sản phẩm thành công!',
            EC: 0,
            DT: {
                ...data,
                teamIds,
                categoryIds
            }
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

const getCategories = async (filterTeam, filterSize, filterColor, teamIds = [], categoryIds = []) => {
    try {
        const categories = await db.Category.findAll({
            attributes: [
                'id',
                'name',
                'slug',
                [Sequelize.fn('COUNT', Sequelize.col('Products.id')), 'productCount']
            ],
            include: [
                {
                    model: db.Product,
                    attributes: [],
                    where: {
                        ...(categoryIds.length > 0 ? { categoryId: { [Op.in]: categoryIds }} : {}),
                        ...(teamIds.length > 0 ? { teamId: { [Op.in]: teamIds } } :
                            filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
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
            group: ['Category.id'],
            order: [['id', 'DESC']],
        });
        
        return categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            productCount: parseInt(category.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getTeams = async (filterCategory, filterSize, filterColor, teamIds = [], categoryIds = []) => {
    try {
        const teams = await db.Team.findAll({
            attributes: [
                'id',
                'name',
                'slug',
                [Sequelize.fn('COUNT', Sequelize.col('Products.id')), 'productCount']
            ],
            include: [
                {
                    model: db.Product,
                    attributes: [],
                    where: {
                        ...(teamIds.length > 0 ? { teamId: { [Op.in]: teamIds } } : {}),
                        ...(categoryIds.length > 0 ? { categoryId: { [Op.in]: categoryIds } } :
                            filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
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
            group: ['Team.id'],
            order: [['id', 'DESC']],
        });
        
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            slug: team.slug,
            productCount: parseInt(team.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getSizes = async (filterCategory, filterTeam, filterColor, teamIds = [], categoryIds = []) => {
    try {
        const sizes = await db.Size.findAll({
            attributes: [
                'id',
                'code',
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Product_Details.productId'))), 'productCount']
            ],
            include: [
                {
                    model: db.Product_Detail,
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: db.Product,
                            attributes: ['id'],
                            where: {
                                ...(categoryIds.length > 0 ? { categoryId: { [Op.in]: categoryIds } } :
                                    filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(teamIds.length > 0 ? { teamId: { [Op.in]: teamIds } } :
                                    filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
                                ...(filterColor.length > 0 && { id: { [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE colorId IN (${filterColor.join(',')}))
                                `)} }),
                            },
                        },
                    ],
                },
            ],
            group: ['Size.id'],
            order: [['id', 'DESC']],
        });
        
        return sizes.map(size => ({
            id: size.id,
            code: size.code,
            productCount: parseInt(size.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getColors = async (filterCategory, filterTeam, filterSize, teamIds = [], categoryIds = []) => {
    try {
        const colors = await db.Color.findAll({
            attributes: [
                'id',
                'name',
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Product_Details.productId'))), 'productCount']
            ],
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
                                ...(categoryIds.length > 0 ? { categoryId: { [Op.in]: categoryIds } } :
                                    filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(teamIds.length > 0 ? { teamId: { [Op.in]: teamIds } } :
                                    filterTeam.length > 0 && { teamId: { [Op.in]: filterTeam } }),
                                ...(filterSize.length > 0 && { id: { [Op.in]: Sequelize.literal(`
                                    (SELECT productId FROM Product_Detail WHERE sizeId IN (${filterSize.join(',')}))
                                `)} }),
                            },
                        },
                    ],
                },
            ],
            group: ['Color.id'],
            order: [['id', 'DESC']],
        });
        
        return colors.map(color => ({
            id: color.id,
            name: color.name,
            productCount: parseInt(color.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
};

const getSingleProduct = async (slug) => {
    try {
        const product = await db.Product.findOne({
            where: {
                slug: slug
            },
            attributes: ['id', 'name', 'price', 'price_sale', 'isSale', 'slug','description'],
            include: [
                {
                    model: db.Product_Image,
                    attributes: ['id', 'image', 'isMainImage'],
                },
                {
                    model: db.Product_Detail,
                    attributes: ['id', 'colorId', 'sizeId', 'quantity', 'image'],
                    include: [
                        {
                            model: db.Color,
                            attributes: ['id', 'name'],
                        },
                        {
                            model: db.Size,
                            attributes: ['id', 'code'],
                        },
                    ],
                },
            ],
        })
        
        if(!product) {
            return {
                EM: "Sản phẩm không tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            return {
                EM: "Lấy thông tin sản phẩm thành công!",
                EC: 0,
                DT: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    price_sale: product.price_sale,
                    isSale: product.isSale,
                    slug: product.slug,
                    description: product.description,
                    images: product.Product_Images,
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
                }
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
    getAllInforProduct,
    getCategories,
    getTeams,
    getSizes,
    getColors,
    getSingleProduct,
}