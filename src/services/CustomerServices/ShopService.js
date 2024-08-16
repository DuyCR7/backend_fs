import db from "../../models/index";
import { Sequelize, Op } from "sequelize";

const getAllInforProduct = async (page, limit, filterTeam, filterCategory, filterSize, filterColor, sortOption, team) => {
    try {
        // Xây dựng điều kiện where cho sản phẩm
        let productWhere = { isActive: true };
        let teamId = null;

        if (team) {
            const teamData = await db.Team.findOne({ where: { slug: team } });
            if (teamData) {
                teamId = teamData.id;
                productWhere.teamId = teamData.id;
            }
        }
        else if (filterTeam.length > 0) {
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
            DT: {
                ...data,
                teamId
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

const getCategories = async (filterTeam, filterSize, filterColor, teamId) => {
    try {
        const categories = await db.Category.findAll({
            attributes: [
                'id',
                'name',
                [Sequelize.fn('COUNT', Sequelize.col('Products.id')), 'productCount']
            ],
            include: [
                {
                    model: db.Product,
                    attributes: [],
                    where: {
                        ...(teamId ? { teamId: teamId } :
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
            productCount: parseInt(category.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getTeams = async (filterCategory, filterSize, filterColor, teamId) => {
    try {
        const teams = await db.Team.findAll({
            attributes: [
                'id',
                'name',
                [Sequelize.fn('COUNT', Sequelize.col('Products.id')), 'productCount']
            ],
            include: [
                {
                    model: db.Product,
                    attributes: [],
                    where: {
                        ...(teamId ? { teamId: teamId } : {}),
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
            group: ['Team.id'],
            order: [['id', 'DESC']],
        });
        
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            productCount: parseInt(team.get('productCount'))
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
}

const getSizes = async (filterCategory, filterTeam, filterColor, teamId) => {
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
                                ...(filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(teamId ? { teamId: teamId } :
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

const getColors = async (filterCategory, filterTeam, filterSize, teamId) => {
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
                                ...(filterCategory.length > 0 && { categoryId: { [Op.in]: filterCategory } }),
                                ...(teamId ? { teamId: teamId } :
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

module.exports = {
    getAllInforProduct,
    getCategories,
    getTeams,
    getSizes,
    getColors,
}