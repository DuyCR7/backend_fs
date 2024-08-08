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

const gerParentCategory = async () => {
    try {
        let categories = await db.Category.findAll({
            where: {
                isActive: true
            },
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

const createCategory = async (dataCategory) => {
    try {
        let category = await db.Category.findOne({
            where: {
                name: dataCategory.name
            }
        });
    
        if(category) {
            return {
                EM: "Tên danh mục đã tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            await db.Category.create(dataCategory);
            return {
                EM: "Tạo mới danh mục thành công!",
                EC: 0,
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

const getCategoryById = async (id) => {
    try {
        let category = await db.Category.findOne({
            where: {
                id: id
            }
        });

        if(category) {
            return {
                EM: `Lấy thông tin danh mục thành công!`,
                EC: 0,
                DT: category,
            }
        } else {
            return {
                EM: "Không tìm thấy danh mục!",
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

const updateCategory = async (dataCategory) => {
    try {
        let category = await db.Category.findOne({
            where: {
                id: dataCategory.id
            }
        });

        if(category) {
            if(category.id !== dataCategory.parent_id) {
                await category.update({
                    name: dataCategory.name,
                    slug: dataCategory.slug,
                    parent_id: dataCategory.parent_id,
                    description: dataCategory.description,
                    image: dataCategory.image
                });
            } else {
                await category.update({
                    name: dataCategory.name,
                    slug: dataCategory.slug,
                    description: dataCategory.description,
                    image: dataCategory.image
                });
            }

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy danh mục!",
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

// Tìm danh mục và các danh mục con của nó
const findCategoryById = (id, categories) => {
    for (let category of categories) {
        if (category.id === id) return category;
        if (category.children) {
            const result = findCategoryById(id, category.children);
            if (result) return result;
        }
    }
    return null;
};

const setActiveCategory = async (id) => {
    try {
        let categories = await db.Category.findAll({
            order: [['id', 'DESC']],
            raw: true,
        });
        const categoryTree = buildCategoryTree(categories);

        const categoryToUpdate = findCategoryById(id, categoryTree);
        if (!categoryToUpdate) {
            return {
                EM: "Danh mục không tồn tại!",
                EC: 1,
                DT: "",
            };
        }

        // Kiểm tra trạng thái của danh mục cha
        const checkParentStatus = (category, status) => {
            if (category.parent_id === 0) return true; // Là danh mục cha
            const parentCategory = findCategoryById(category.parent_id, categoryTree);
            if (parentCategory && !parentCategory.isActive) return false;
            return checkParentStatus(parentCategory, status);
        };

        // Đổi trạng thái danh mục cần cập nhật
        const newStatus = !categoryToUpdate.isActive;

        if (!checkParentStatus(categoryToUpdate, newStatus)) {
            return {
                EM: "Không thể thay đổi trạng thái vì danh mục cha không hoạt động",
                EC: 1,
                DT: "",
            };
        }

        // Cập nhật trạng thái của danh mục và các danh mục con nếu cần
        const updateCategoryStatus = async (category, status) => {
            await db.Category.update(
                { isActive: status },
                { where: { id: category.id } }
            );

            if (category.children) {
                for (let child of category.children) {
                    await updateCategoryStatus(child, status);
                }
            }
        };

        // Cập nhật trạng thái của danh mục và các danh mục con
        if (categoryToUpdate.children && categoryToUpdate.children.length > 0) {
            if (!categoryToUpdate.isActive) {
                // Nếu danh mục cha không hoạt động, chỉ cập nhật trạng thái của danh mục cha
                await db.Category.update(
                    { isActive: newStatus },
                    { where: { id: categoryToUpdate.id } }
                );
            } else {
                // Nếu danh mục cha đang hoạt động, cập nhật trạng thái cho tất cả danh mục con
                await updateCategoryStatus(categoryToUpdate, newStatus);
            }
        } else {
            await db.Category.update(
                { isActive: newStatus },
                { where: { id: categoryToUpdate.id } }
            );
        }

        return {
            EM: "Cập nhật thành công!",
            EC: 0,
            DT: "",
        };
        
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

const getAllProductIdsInCategory = async (category) => {
    let productIds = [];

    // Lấy các sản phẩm thuộc danh mục hiện tại
    const products = await db.Product.findAll({
        where: { categoryId: category.id },
        attributes: ['id']
    });
    productIds = productIds.concat(products.map(p => p.id));

    // Lấy các sản phẩm thuộc các danh mục con
    if (category.children) {
        for (let child of category.children) {
            productIds = productIds.concat(await getAllProductIdsInCategory(child));
        }
    }

    return productIds;
}

const deleteCategory = async (id) => {
    try {
        let categories = await db.Category.findAll({
            order: [['id', 'DESC']],
            raw: true,
        });
        const categoryTree = buildCategoryTree(categories);

        const categoryToDelete = findCategoryById(id, categoryTree);
        if (!categoryToDelete) {
            return {
                EM: "Danh mục không tồn tại!",
                EC: -1,
                DT: "",
            };
        }

        // Xóa danh mục và các danh mục con
        const deleteCategoryAndChildren = async (category) => {
            // Xóa các sản phẩm thuộc danh mục
            const productIds = await getAllProductIdsInCategory(category);
            console.log("Product Ids===========================================: " , productIds);
            // Xóa các bảng liên quan của sản phẩm
            await db.Product_Image.destroy({
                where: { productId: productIds }
            });
            await db.Product_Detail.destroy({
                where: { productId: productIds }
            });

            await db.Product.destroy({
                where: { id: productIds }
            });

            if (category.children) {
                for (let child of category.children) {
                    await deleteCategoryAndChildren(child);
                }
            }
            await db.Category.destroy({
                where: { id: category.id }
            });
        };

        // Bắt đầu xóa danh mục và các danh mục con (nếu có)
        await deleteCategoryAndChildren(categoryToDelete);

        return {
            EM: "Xóa danh mục thành công!",
            EC: 0,
            DT: "",
        };

    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

module.exports = {
    gerParentCategory,
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    setActiveCategory,
    deleteCategory,
}