import db from "../../models/index";
import { Op } from "sequelize";

const createSize = async (dataSize) => {
    try {
        console.log("dataSize: " , dataSize)
        let size = await db.Size.findOne({
            where: {
                [Op.or]: [{ name: dataSize.name }, { code: dataSize.code }],
            }
        });
    
        if(size) {
            return {
                EM: "Tên size hoặc mã code đã tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            await db.Size.create(dataSize);
            return {
                EM: "Tạo mới size thành công!",
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

const getAllSizes = async () => {
    try {
        let sizes = await db.Size.findAll({
            order: [[
                'id', 'DESC'
            ]]
        })

        if(sizes) {
            return {
                EM: "Lấy thông tin tất cả size thành công!",
                EC: 0,
                DT: sizes
            }
        } else {
            return {
                EM: "Không tìm thấy size nào!",
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

const getSizesWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Size.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            sizes: rows,
        }

        return {
            EM: "Lấy thông tin size thành công!",
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

const setActiveSize = async (id) => {
    try {
        let size = await db.Size.findOne({
            where: {
                id: id
            }
        });

        if(size) {
            await size.update({
                isActive: !size.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy size!",
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

const updateSize = async (dataSize) => {
    try {
        let size = await db.Size.findOne({
            where: {
                id: dataSize.id
            }
        });

        if(size) {
            await size.update({
                name: dataSize.name,
                code: dataSize.code,
                description: dataSize.description
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy size!",
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

const deleteSize = async (id) => {
    try {
        const productCount = await db.Product_Detail.count({
            where: {
                sizeId: id
            }
        });

        if (productCount > 0) {
            return {
                EM: `Không thể xóa size này vì đang có sản phẩm sử dụng!`,
                EC: 1,
                DT: "",
            };
        }

        await db.Size.destroy({
            where: {
                id: id
            }
        });

        return {
            EM: `Xóa thành công!`,
            EC: 0,
            DT: "",
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

module.exports = {
    createSize,
    getAllSizes,
    getSizesWithPagination,
    setActiveSize,
    updateSize,
    deleteSize,
}