import moment from "moment";
import db from "../../models/index";
import { fn, col, Op, literal, where } from "sequelize";

const getStatisticSome = async () => {
    try {
        const [totalCustomers, totalAdmins, totalRevenue, totalOrders] = await Promise.all([
            db.Customer.count(),
            db.User.count(),
            db.Order.sum('totalPrice', { where: { status: 4 } }),
            db.Order.count({where: { status: 4}})
        ]);

        return {
            EM: "Thống kê thành công",
            EC: 0,
            DT: {
                totalCustomers,
                totalAdmins,
                totalRevenue,
                totalOrders
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

const getRevenueStatistic = async (type, year) => {
    try {
        let whereClause, groupBy, selectExpression;

        switch (type) {
            case 'month':
                groupBy = 'month';
                selectExpression = [fn('DATE_FORMAT', col('createdAt'), '%m-%Y'), 'month'];
                break;
            case 'quarter':
                groupBy = 'quarter';
                selectExpression = [
                    literal(`CONCAT('Q', QUARTER(createdAt), '-', YEAR(createdAt))`),
                    'quarter'
                ];
                break;
            case 'year':
                groupBy = 'year';
                selectExpression = [fn('YEAR', col('createdAt')), 'year'];
                break;
            default:
                return {
                    EM: "Loại thống kê không hợp lệ!",
                    EC: -1,
                    DT: ""
                }
        }

        whereClause = {
            status: 4,
            createdAt: {
                [Op.and]: [
                    where(fn('YEAR', col('createdAt')), year)
                ]
            }
        };

        const revenue = await db.Order.findAll({
            attributes: [
                selectExpression,
                [fn('SUM', col('totalPrice')), 'revenue'],
            ],
            where: whereClause,
            group: groupBy,
            order: [[groupBy, 'ASC']]
        });

        return {
            EM: "Thống kê thành công!",
            EC: 0,
            DT: revenue
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

const getBestSlowSelling = async (type, year) => {
    try {
        let whereClause, groupBy, selectExpression, orderBy;

        switch (type) {
            case 'month':
                groupBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), fn('MONTH', col('Product_Details.Order_Details.Order.createdAt'))];
                selectExpression = [
                    [fn('DATE_FORMAT', col('Product_Details.Order_Details.Order.createdAt'), '%m-%Y'), 'time_period']
                ];
                orderBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), fn('MONTH', col('Product_Details.Order_Details.Order.createdAt'))];
                break;
            case 'quarter':
                groupBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), fn('QUARTER', col('Product_Details.Order_Details.Order.createdAt'))];
                selectExpression = [
                    [fn('CONCAT', 'Q', fn('QUARTER', col('Product_Details.Order_Details.Order.createdAt')), '-', fn('YEAR', col('Product_Details.Order_Details.Order.createdAt'))), 'time_period']
                ];
                orderBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), fn('QUARTER', col('Product_Details.Order_Details.Order.createdAt'))];
                break;
            case 'year':
                groupBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt'))];
                selectExpression = [
                    [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), 'time_period']
                ];
                orderBy = [fn('YEAR', col('Product_Details.Order_Details.Order.createdAt'))];
                break;
            default:
                return {
                    EM: "Loại thống kê không hợp lệ!",
                    EC: -1,
                    DT: ""
                }
        }

        whereClause = {
            '$Product_Details.Order_Details.Order.status$': 4,
            '$Product_Details.Order_Details.Order.createdAt$': where(fn('YEAR', col('Product_Details.Order_Details.Order.createdAt')), year)
        };

        let productSales = await db.Product.findAll({
            attributes: [
                'id',
                'name',
                ...selectExpression,
                [fn('SUM', col('Product_Details.Order_Details.quantity')), 'totalSold']
            ],
            where: { isActive: true },
            include: [
                {
                    model: db.Team,
                    attributes: [],
                    where: { isActive: true }
                },
                {
                    model: db.Category,
                    attributes: [],
                    where: { isActive: true }
                },
                {
                    model: db.Product_Detail,
                    attributes: [],
                    include: [
                        {
                            model: db.Order_Detail,
                            attributes: [],
                            include: [
                                {
                                    model: db.Order,
                                    attributes: [],
                                    where: whereClause
                                }
                            ]
                        }
                    ]
                }
            ],
            group: ['Product.id', ...groupBy],
            having: where(fn('SUM', col('Product_Details.Order_Details.quantity')), '>', 0),
            order: [...orderBy, [fn('SUM', col('Product_Details.Order_Details.quantity')), 'DESC']],
            raw: true
        });

        // Phân loại sản phẩm theo bán chạy và bán chậm
        let result = productSales.reduce((acc, product) => {
            if (!acc[product.time_period]) {
                acc[product.time_period] = {
                    bestSelling: [],
                    slowSelling: []
                };
            }
            
            if (product.totalSold > 10) {
                acc[product.time_period].bestSelling.push(product);
            } else if (product.totalSold < 5) {
                acc[product.time_period].slowSelling.push(product);
            }
            
            return acc;
        }, {});

        return {
            EM: "Thống kê thành công!",
            EC: 0,
            DT: result
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

const getBestWishList = async () => {
    try {

        const topProducts = await db.Wish_List.findAll({
            attributes: [
                'productId',
                [fn('COUNT', col('productId')), 'wishCount']
            ],
            include: [{
                model: db.Product,
                attributes: ['id', 'name', 'categoryId'],
                include: [{
                    model: db.Category,
                    attributes: ['id', 'name', 'parent_id'],
                }]
            }],
            group: ['productId'],
            order: [[literal('wishCount'), 'DESC']],
            limit: 5
        });

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

        const formattedProducts = topProducts.map(item => {
            const product = item.Product;
            const rootCategory = findRootCategory(product.categoryId);

            return {
                id: product.id,
                name: product.name,
                wishCount: item.get('wishCount'),
                category: rootCategory ? {
                    id: rootCategory.id,
                    name: rootCategory.name
                } : null
            };
        });

        return {
            EM: "Thống kê thành công!",
            EC: 0,
            DT: formattedProducts
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

const getStatusName = (statusCode) => {
    const statusMap = {
        0: 'Đã hủy',
        1: 'Chờ xác nhận',
        2: 'Gửi hàng',
        3: 'Đang giao',
        4: 'Đã hoàn thành'
    };
    return statusMap[statusCode] || 'Unknown';
}

const getOrderStatus = async (type, value) => {
    try {
        let whereClause, groupBy, selectExpression;

        switch (type) {
            case 'day':
                if (!Array.isArray(value) || value.length !== 2) {
                    return {
                        EM: "Thông số ngày không hợp lệ!",
                        EC: -1,
                        DT: ""
                    }
                }
                const [startDate, endDate] = value.map(date => moment(date, "YYYY-MM-DD").toDate());
                groupBy = 'date';
                endDate.setHours(23, 59, 59, 999);
                // console.log(startDate, endDate);
                selectExpression = [fn('DATE', fn('CONVERT_TZ', col('createdAt'), '+00:00', '+07:00')), 'date'];
                whereClause = {
                    createdAt: {
                        [Op.between]: [
                            startDate, 
                            endDate
                        ]
                    }
                }
                break;
            
            case 'month':
                if (typeof value !== 'string' || value.length !== 7) {
                    return {
                        EM: "Thông số tháng không hợp lệ!",
                        EC: -1,
                        DT: ""
                    };
                }
                const yearMonth = value;
                groupBy = 'month';
                selectExpression = [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'];
                whereClause = where(fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), yearMonth);
                break;
            
            case 'year':
                if (typeof value !== 'string' || value.length !== 4) {
                    return {
                        EM: "Thông số năm không hợp lệ!",
                        EC: -1,
                        DT: ""
                    };
                }
                const year = value;
                groupBy = 'year';
                selectExpression = [fn('YEAR', col('createdAt')), 'year'];
                whereClause = where(fn('YEAR', col('createdAt')), year);
                break;

            default:
                return {
                    EM: "Loại thống kê không hợp lệ!",
                    EC: -1,
                    DT: ""
                }
        }


        const orderStatusCounts = await db.Order.findAll({
            attributes: [
                selectExpression,
                [col('status'), 'status'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: whereClause,
            group: [groupBy, 'status'],
            order: [[groupBy, 'ASC'], ['status', 'ASC']]
        });

        const formattedResults = orderStatusCounts.reduce((acc, record) => {
            const period = record.get(groupBy);
            if (!acc[period]) {
                acc[period] = {
                    [groupBy]: period,
                    total: 0,
                    statuses: {
                        'Đã hủy': 0,
                        'Chờ xác nhận': 0,
                        'Gửi hàng': 0,
                        'Đang giao': 0,
                        'Đã hoàn thành': 0
                    }
                };
            }
            
            const status = getStatusName(record.status);
            const count = record.get('count');
            
            acc[period].statuses[status] = count;
            acc[period].total += count;
            
            return acc;
        }, {});

        const results = Object.values(formattedResults);

        return {
            EM: "Thống kê thành công!",
            EC: 0,
            DT: results
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

const getAvailableProduct = async (page, limit, sortField, sortOrder) => {
    try {
        let offset = (page - 1) * limit;
        let order = [];

        if (sortField) {
            if (sortField === 'soldQuantity') {
                order.push([literal('soldQuantity'), sortOrder.toUpperCase()]);
            } else {
                order.push([sortField, sortOrder.toUpperCase()]);
            }
        } else {
            order.push([{model: db.Product}, 'id', 'DESC']);
        }

        const { count, rows } = await db.Product_Detail.findAndCountAll({
            attributes: [
                'id',
                'quantity',
                [
                    literal(`(
                        SELECT COALESCE(SUM(Order_Detail.quantity), 0)
                        FROM Order_Detail AS Order_Detail
                        JOIN \`Order\` AS Orders ON Order_Detail.orderId = Orders.id
                        WHERE Order_Detail.productDetailId = Product_Detail.id
                        AND Orders.status = 4
                    )`),
                    'soldQuantity'
                ]
            ],
            include: [
                {
                    model: db.Product,
                    attributes: ['id', 'name'],
                },
                {
                    model: db.Size,
                    attributes: ['id', 'code'],
                },
                {
                    model: db.Color,
                    attributes: ['id', 'name'],
                },
            ],
            order: order,
            limit,
            offset,
            subQuery: false,
        });

        return {
            EM: "Thống kê thành công!",
            EC: 0,
            DT: {
                totalRows: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                products: rows
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
    getStatisticSome,
    getRevenueStatistic,
    getBestSlowSelling,
    getBestWishList,
    getOrderStatus,
    getAvailableProduct,
}