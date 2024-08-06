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
    try {
        console.log(dataProduct);
        if(!dataProduct.price_sale) {
            dataProduct.price_sale = 0;
        }

        const newProduct = await db.Product.create({
            name: dataProduct.name,
            price: dataProduct.price,
            price_sale: dataProduct.price_sale,
            image: dataProduct.image,
            categoryId: dataProduct.categoryId,
            teamId: dataProduct.teamId,
        });

        if(dataProduct.images && dataProduct.images.length > 0) {
            const imageInfoArray = JSON.parse(dataProduct.imageInfo);
            const productImages = dataProduct.images.map((file, index) => ({
                productId: newProduct.id,
                image: file.filename,
                isMainImage: imageInfoArray[index].isMainImage
            }));

            await db.Product_Image.bulkCreate(productImages);
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
            await db.Product_Detail.bulkCreate(allDetails);
        }

        return {
            EM: "Tạo sản phẩm thành công!",
            EC: 0,
            DT: newProduct
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
    getAllCategories,
    getAllTeams,
    getAllColors,
    getAllSizes,
    createProduct,
}