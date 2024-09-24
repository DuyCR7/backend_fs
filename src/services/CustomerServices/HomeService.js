import db from "../../models/index";
import { fn, col, Op } from "sequelize";

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
                isActive: true,
                isHome: true,
            },
            order: [
                [
                    'updatedAt', 'DESC'
                ]
            ]
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
                'createdAt', 'DESC'
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

                const ratings = product.Reviews.map(review => review.rating);
                const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

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
                },
                {
                    model: db.Category,
                    attributes: ['id', 'name', 'slug'],
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

const getAllSalesProducts = async () => {
    try {
        let allSalesProducts = await db.Product.findAll({
            where: {
                isActive: true,
                isSale: true
            },
            include: [
                {
                    model: db.Product_Image,
                    where: { isMainImage: true },
                    attributes: ['image'],
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
                {
                    model: db.Review,
                    attributes: ['rating'],
                }
            ],
            order: [[
                'id', 'DESC'
            ]]
        });

        allSalesProducts = allSalesProducts.map(product => {
            const ratings = product.Reviews.map(review => review.rating);
            const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                price_sale: product.price_sale,
                slug: product.slug,
                isSale: product.isSale,
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
            EM: "Lấy thông tin tất cả sản phẩm đã bán thành công!",
            EC: 0,
            DT: allSalesProducts
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

const getAllBestSeller = async () => {
    try {
        let productSales = await db.Product.findAll({
            attributes: [
                'id',
                'name',
                'price',
                'price_sale',
                'isSale',
                'slug',
                [fn('SUM', col('Product_Details.Order_Details.quantity')), 'totalSold']
            ],
            include: [
                {
                    model: db.Product_Image,
                    where: { isMainImage: true },
                    attributes: ['image'],
                },
                {
                    model: db.Product_Detail,
                    attributes: ['id'],
                    include: [
                        {
                            model: db.Order_Detail,
                            attributes: [],
                            include: [
                                {
                                    model: db.Order,
                                    where: { status: 4 },
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            group: ['Product.id'],
            order: [[fn('SUM', col('Product_Details.Order_Details.quantity')), 'DESC']],
            limit: 8,
            subQuery: false,
        });

        // Bước 2: Lấy chi tiết cho mỗi sản phẩm
        const productDetails = await Promise.all(productSales.map(async (product) => {
            const details = await db.Product_Detail.findAll({
                where: { productId: product.id },
                attributes: ['id', 'colorId', 'sizeId', 'quantity', 'image'],
                include: [
                    {
                        model: db.Color,
                        attributes: ['id', 'name'],
                    },
                    {
                        model: db.Size,
                        attributes: ['id', 'code'],
                    }
                ]
            });

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                price_sale: product.price_sale,
                isSale: product.isSale,
                slug: product.slug,
                image: product.Product_Images[0]?.image,
                details: details.map(detail => ({
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
                })),
                totalSold: parseInt(product.get('totalSold')) || 0
            };
        }));
      
        // Bước 2: Truy vấn rating trung bình của từng sản phẩm
        const productRatings = await db.Product.findAll({
            attributes: [
                'id',
                // Tính rating trung bình
                [fn('AVG', col('Reviews.rating')), 'avgRating']
            ],
            include: [
                {
                    model: db.Review,
                    attributes: []
                }
            ],
            group: ['Product.id'],
        });
    
        // Bước 3: Kết hợp dữ liệu bán và rating trung bình
        const combinedResults = productDetails.map(product => {
            const ratingData = productRatings.find(r => r.id === product.id);
            return {
                ...product,
                averageRating: ratingData && ratingData.get('avgRating') !== null ? parseFloat(ratingData.get('avgRating')) : 0  // Nếu không có rating, trả về null
            };
        });

        return {
            EM: "Lấy thông tin 8 sản phẩm bán chạy nhất thành công!",
            EC: 0,
            DT: combinedResults
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

const getPost = async () => {
    try {
        let posts = await db.Post.findAll({
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'username'],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 3
        });
        if(posts && posts.length > 0) {
            return {
                EM: "Lấy thông tin bài viết thành công!",
                EC: 0,
                DT: posts
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết nào!",
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
    getSearchProducts,
    getAllSalesProducts,
    getAllBestSeller,
    getPost,
}