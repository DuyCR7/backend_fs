import db from "../../models/index";
import { Op } from "sequelize";

const buildCategoryTree = (categories, parentId = 0) => {
    let tree = [];
    categories.forEach(category => {
        if (category.parent_id === parentId) {
            const children = buildCategoryTree(categories, category.id);
            if (children.length) {
                category.children = children;
            }
            tree.push(category);
        }
    });
    return tree;
}

const getAllCategories = async () => {
    try {
        let categories = await db.Category.findAll({
            order: [
                ['id', 'DESC'],
            ],
            raw: true,
        });

        if(categories) {
            const categoryTree = buildCategoryTree(categories);

            return {
                EM: "Lấy thông tin tất cả danh mục thành công!",
                EC: 0,
                DT: categoryTree
            }
        }

        else {
            return {
                EM: "Không tìm thấy danh mục nào!",
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
            order: [
                ['id', 'DESC'],
            ],
            raw: true,
        });

        if(teams) {
            return {
                EM: "Lấy thông tin tất cả đội bóng thành công!",
                EC: 0,
                DT: teams
            }
        }

        else {
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

const getAllColors = async () => {
    try {
        let colors = await db.Color.findAll({
            order: [
                ['id', 'DESC'],
            ],
            raw: true,
        });

        if(colors) {
            return {
                EM: "Lấy thông tin tất cả màu sắc thành công!",
                EC: 0,
                DT: colors
            }
        }

        else {
            return {
                EM: "Không tìm thấy màu sắc nào!",
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

const getAllSizes = async () => {
    try {
        let sizes = await db.Size.findAll({
            order: [
                ['id', 'DESC'],
            ],
            raw: true,
        });

        if(sizes) {
            return {
                EM: "Lấy thông tin tất cả kích cỡ thành công!",
                EC: 0,
                DT: sizes
            }
        }

        else {
            return {
                EM: "Không tìm thấy kích cỡ nào!",
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

const createProduct = async (dataProduct) => {
    const transaction = await db.sequelize.transaction();

    try {
        // console.log(dataProduct);
        if(!dataProduct.price_sale) {
            dataProduct.price_sale = 0;
        }

        if(!dataProduct.description) {
            dataProduct.description = '';
        }

        let checkExistName = await db.Product.findOne({
            where: {
                name: dataProduct.name
            },
            transaction: transaction
        });

        if(checkExistName) {
            return {
                EM: `Đã tồn tại sản phẩm có ten: ${dataProduct.name}!`,
                EC: 1,
                DT: ""
            }
        }

        const newProduct = await db.Product.create({
            name: dataProduct.name,
            slug: dataProduct.slug,
            description: dataProduct.description,
            price: dataProduct.price,
            price_sale: dataProduct.price_sale,
            image: dataProduct.image,
            categoryId: dataProduct.categoryId,
            teamId: dataProduct.teamId,
        }, {transaction});

        if(dataProduct.images && dataProduct.images.length > 0) {
            const imageInfoArray = JSON.parse(dataProduct.imageInfo);
            const productImages = dataProduct.images.map((file, index) => ({
                productId: newProduct.id,
                image: file.filename,
                isMainImage: imageInfoArray[index].isMainImage
            }));

            await db.Product_Image.bulkCreate(productImages, {transaction});
        }

        if (dataProduct.productDetails) {
            const details = JSON.parse(dataProduct.productDetails);
            const detailImages = dataProduct.detailImages || [];
            let imageIndex = 0;
    
            // console.log("details: " , details);
            // console.log("detailImages: " , detailImages);
            let allDetails = [];
            details.map(detail => {
                let detailImage = null;
                if (detail.hasImage && imageIndex < detailImages.length) {
                    detailImage = detailImages[imageIndex].filename;
                    imageIndex++;
                }
                
                const detailInfo = detail.sizes.map((item, index) => {
                    return {
                        productId: newProduct.id,
                        sizeId: +item.sizeId,
                        colorId: +detail.colorId,
                        image: detailImage,
                        quantity: +item.quantity,
                    }
            });
            allDetails = allDetails.concat(detailInfo);
            
            });
            // console.log("allDetails: " ,allDetails);
            await db.Product_Detail.bulkCreate(allDetails, {transaction});
        }

        await transaction.commit();

        return {
            EM: "Tạo sản phẩm thành công!",
            EC: 0,
            DT: newProduct
        }

    } catch (e) {
        await transaction.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const getProductsWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Product.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
            include: [
                {
                    model: db.Category,
                    attributes: ['name']
                },
                {
                    model: db.Team,
                    attributes: ['name']
                },
                {
                    model: db.Product_Image,
                    attributes: ['id', 'image', 'isMainImage']
                },
                {
                    model: db.Product_Detail,
                    attributes: ['id', 'sizeId', 'colorId', 'quantity', 'image']
                },
            ],
            distinct: true
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            products: rows,
        }

        return {
            EM: "Lấy thông tin sản phẩm thành công!",
            EC: 0,
            DT: data
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

const getAllProducts = async () => {
    try {
        let products = await db.Product.findAll({
            order: [[
                'id', 'DESC'
            ]]
        })

        if(products) {
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

const setActiveField = async (id, field) => {
    const transaction = await db.sequelize.transaction();

    try {
        let product = await db.Product.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: db.Category,
                    attributes: ['isActive'],
                    required: true // Đảm bảo rằng có kết nối tới Category
                },
                {
                    model: db.Team,
                    attributes: ['isActive'],
                    required: true // Đảm bảo rằng có kết nối tới Team
                }
            ]
        });

        if (!product) {
            return {
                EM: "Không tìm thấy sản phẩm",
                EC: 1,
                DT: "",
            };
        }

        if (field === 'isActive') {
            // Kiểm tra nếu product đang có isActive = false mà Category hoặc Team cũng có isActive = false
            if (!product.isActive && (product.Category.isActive === false || product.Team.isActive === false)) {
                return {
                    EM: "Danh mục hoặc đội bóng của sản phẩm này không hoạt động. Vui lòng kích hoạt danh mục và đội bóng trước.",
                    EC: 1,
                    DT: "",
                };
            }

            if (product.isActive) {
                await db.Cart_Detail.destroy({
                    where: {
                        productId: id
                    },
                    transaction
                })
            }
        }

        // Cập nhật trường được chỉ định (isActive, isSale, isTrending)
        await product.update({
            [field]: !product[field]
        }, {
            transaction
        });

        await transaction.commit();

        return {
            EM: `Cập nhật thành công!`,
            EC: 0,
            DT: "",
        };

        
    } catch (e) {
        await transaction.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

const getProductById = async (id) => {
    try {
        let product = await db.Product.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: db.Product_Image,
                    attributes: ['id', 'image', 'isMainImage']
                },
                {
                    model: db.Product_Detail,
                    attributes: ['id', 'sizeId', 'colorId', 'quantity', 'image']
                },
            ],
            distinct: true,
        });
        if(!product) {
            return {
                EM: "Không tìm thấy sản phẩm!",
                EC: 1,
                DT: ""
            }
        } else {
            return {
                EM: "Lấy thông tin sản phẩm thành công!",
                EC: 0,
                DT: product.toJSON()
            }
        }
        
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

const updateProduct = async (dataProduct) => {
    try {
        const transaction = await db.sequelize.transaction();
        try {
            let checkExistName = await db.Product.findAll({
                where: {
                    name: dataProduct.name,
                    id: { [Op.not]: dataProduct.id }
                },
                transaction
            });
            if(checkExistName.length > 0) {
                return {
                    EM: `Đã tồn tại sản phẩm có tên: ${dataProduct.name}!`,
                    EC: 1,
                    DT: "",
                }
            }

            // Cập nhật thông tin cơ bản của sản phẩm
            await db.Product.update({
                name: dataProduct.name,
                slug: dataProduct.slug,
                description: dataProduct.description,
                price: dataProduct.price,
                price_sale: dataProduct.price_sale,
                categoryId: dataProduct.categoryId,
                teamId: dataProduct.teamId,
            }, { 
                where: { id: dataProduct.id },
                transaction
            });

            // Xử lý Product_Images
            const imageInfoArray = JSON.parse(dataProduct.imageInfo);
            if (dataProduct.images && dataProduct.images.length > 0) {
                // Xóa ảnh cũ
                await db.Product_Image.destroy({ 
                    where: { productId: dataProduct.id }, 
                    transaction
                });
    
                // Thêm ảnh mới
                const productImages = dataProduct.images.map((file, index) => ({
                    productId: dataProduct.id,
                    image: file.filename,
                    isMainImage: imageInfoArray[index].isMainImage
                }));
                await db.Product_Image.bulkCreate(productImages, {transaction});

            } else {
                // Cập nhật thông tin isMainImage nếu chỉ thay đổi ảnh chính
                for (let i = 0; i < imageInfoArray.length; i++) {
                    await db.Product_Image.update(
                        { isMainImage: imageInfoArray[i].isMainImage },
                        { 
                            where: { 
                                productId: dataProduct.id,
                                id: dataProduct.Product_Images[i].id 
                            },
                            transaction
                        }
                    );
                }
            }

            const details = JSON.parse(dataProduct.productDetails);

            // Lấy tất cả Product_Detail hiện có cho sản phẩm này
            const existingDetails = await db.Product_Detail.findAll({
                where: { productId: dataProduct.id },
                include: [
                    { model: db.Color, attributes: ['name'] },
                    { model: db.Size, attributes: ['code'] }
                ],
                transaction,
            });

            for (const detail of details) {
                let detailImage = null;
                if (detail.hasImage && dataProduct.detailImages) {
                    console.log("fihsfihsdpfhs", Buffer.from("rosÃ©.jpg", 'latin1').toString('utf8'))
                    const matchingFile = dataProduct.detailImages.find(file => Buffer.from(file.originalname, 'latin1').toString('utf8') === detail.imageName);
                    if (matchingFile) {
                        console.log("matching file ", matchingFile);
                        detailImage = matchingFile.filename;
                    }
                }
                if (!detailImage && detail.imagePreview) {
                    detailImage = detail.imagePreview.split('/').pop();
                }
                
                for (const item of detail.sizes) {
                    const existingDetail = existingDetails.find(ed => 
                        ed.sizeId === +item.sizeId && 
                        ed.colorId === +detail.colorId
                    );

                    if (existingDetail) {
                        // Cập nhật bản ghi hiện có
                        await existingDetail.update({
                            image: detailImage,
                            quantity: +item.quantity,
                        }, { transaction });
                    } else {
                        // Tạo bản ghi mới nếu không tồn tại
                        await db.Product_Detail.create({
                            productId: dataProduct.id,
                            sizeId: +item.sizeId,
                            colorId: +detail.colorId,
                            image: detailImage,
                            quantity: +item.quantity,
                        }, { transaction });
                    }
                }
            }

            // Xóa các bản ghi không còn được sử dụng
            const updatedDetailIds = details.flatMap(detail => 
                detail.sizes.map(item => `${detail.colorId}-${item.sizeId}`)
            );
            console.log("details", details);
            console.log("existingDetails", existingDetails.map(detail => detail.get({ plain: true })));
            console.log("updatedDetailIds", updatedDetailIds);
            let cannotDeleteDetails = [];
            
            for (const existingDetail of existingDetails) {
                if (!updatedDetailIds.includes(`${existingDetail.colorId}-${existingDetail.sizeId}`)) {
                    // Kiểm tra xem Product_Detail có trong Order_Detail không
                    const orderDetailCount = await db.Order_Detail.count({
                        where: { productDetailId: existingDetail.id },
                        transaction
                    });
                    
                    if (orderDetailCount > 0) {
                        // Nếu có, thêm vào danh sách không thể xóa
                        cannotDeleteDetails.push({
                            id: existingDetail.id,
                            color: existingDetail.Color.name,
                            size: existingDetail.Size.code
                        });
                    } else {
                        // Nếu không, tiến hành xóa
                        await db.Product_Detail.destroy({
                            where: { id: existingDetail.id },
                            transaction
                        });
                    }
                }
            }

            await transaction.commit();

            let message = "Cập nhật sản phẩm thành công!";
            if (cannotDeleteDetails.length > 0) {
                message += ` Tuy nhiên, Không thể xóa ${cannotDeleteDetails.length} chi tiết sản phẩm do đã có trong đơn hàng:\n`;
                cannotDeleteDetails.forEach(detail => {
                    message += `Màu: ${detail.color}, Size: ${detail.size}\n`;
                });
            }

            return {
                EM: message.trim(),
                EC: cannotDeleteDetails.length > 0 ? 1 : 0,
                DT: cannotDeleteDetails,
            }
        } catch (e) {
            await transaction.rollback();
            return {
                EM: "Lỗi, vui lòng thử lại sau!",
                EC: -1,
                DT: "",
            }
        }
        
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        }
    }
}

const deleteProduct = async (id) => {
    const transaction = await db.sequelize.transaction();

    try {
        const product = await db.Product.findOne({
            where: {
                id: id
            },
            transaction
        });
        if (!product) {
            await transaction.rollback();
            return {
                EM: "Sản phẩm không tồn tại!",
                EC: 1,
                DT: "",
            }
        }

        // Kiểm tra xem có Order nào đã chứa Product_Detail của sản phẩm này không
        const productDetails = await db.Product_Detail.findAll({
            where: { productId: id },
            attributes: ['id'],
            transaction
        });

        const productDetailIds = productDetails.map(detail => detail.id);
        console.log("productDetailIds", productDetailIds);

        const orderDetail = await db.Order_Detail.findOne({
            where: { productDetailId: productDetailIds },
            transaction
        });

        if (orderDetail) {
            await transaction.rollback();
            return {
                EM: "Không thể xóa sản phẩm vì đã tồn tại trong đơn hàng!",
                EC: -1,
                DT: "",
            };
        }

        await db.Cart_Detail.destroy({
            where: {
                productDetailId: productDetailIds
            },
            transaction
        });


        await db.Product_Image.destroy({
            where: {
                productId: id
            },
            transaction
        });

        await db.Product_Detail.destroy({
            where: {
                productId: id
            },
            transaction
        });

        await db.Product.destroy({
            where: {
                id: id
            },
            transaction
        });

        await transaction.commit();

        return {
            EM: "Xóa sản phẩm thành công!",
            EC: 0,
            DT: "",
        }
    } catch (e) {
        await transaction.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        }
    }
}

module.exports = {
    getAllCategories,
    getAllTeams,
    getAllColors,
    getAllSizes,
    createProduct,
    getProductsWithPagination,
    getAllProducts,
    setActiveField,
    getProductById,
    updateProduct,
    deleteProduct,
}