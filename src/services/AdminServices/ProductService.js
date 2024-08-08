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
    try {
        let product = await db.Product.findOne({
            where: {
                id: id
            }
        });

        if(product) {
            await product.update({
                [field]: !product[field]
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy sản phẩm",
                EC: 1,
                DT: "",
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
            // console.log("details", details);
            await db.Product_Detail.destroy({ 
                where: { productId: dataProduct.id }, 
                transaction
            });

            let allDetails = [];
            for (const detail of details) {
                let detailImage = null;
                if (detail.hasImage && dataProduct.detailImages) {
                    const matchingFile = dataProduct.detailImages.find(file => file.originalname === detail.imageName);
                    // console.log("matchingFile", matchingFile);
                    if (matchingFile) {
                        detailImage = matchingFile.filename;
                    }
                }
                if (!detailImage && detail.imagePreview) {
                    // Lấy tên file từ URL imagePreview nếu không có ảnh mới
                    detailImage = detail.imagePreview.split('/').pop();
                }
                    
                const detailInfo = detail.sizes.map(item => ({
                    productId: dataProduct.id,
                    sizeId: +item.sizeId,
                    colorId: +detail.colorId,
                    image: detailImage,
                    quantity: +item.quantity,
                }));
                allDetails = allDetails.concat(detailInfo);
            }
            // console.log("allDetails", allDetails);
            await db.Product_Detail.bulkCreate(allDetails, {transaction});

            await transaction.commit();

            return {
                EM: "Cập nhật sản phẩm thành công!",
                EC: 0,
                DT: "",
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