import db from "../../models/index";
import { Op } from "sequelize";

const gerParentCategory = async () => {
    try {
        let parentCategories = await db.Category.findAll({
            where: {
                parent_id: 0
            }
        });
    
        if(parentCategories) {
            return {
                EM: "Lấy danh sách danh mục cha thành công!",
                EC: 0,
                DT: parentCategories
            }
        } else {
            return {
                EM: "Không tìm thấy danh mục cha!",
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

module.exports = {
    gerParentCategory,
    createCategory,
    getAllCategories,
}