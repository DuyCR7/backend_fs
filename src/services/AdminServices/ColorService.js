import db from "../../models/index";
import { Op } from "sequelize";

const createColor = async (dataColor) => {
    try {
        console.log("dataColor: " , dataColor)
        let color = await db.Color.findOne({
            where: {
                [Op.or]: [{ name: dataColor.name }, { code: dataColor.code }],
            }
        });
    
        if(color) {
            return {
                EM: "Tên màu hoặc mã màu đã tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            await db.Color.create(dataColor);
            return {
                EM: "Tạo mới màu thành công!",
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

const getAllColors = async () => {
    try {
        let colors = await db.Color.findAll({
            order: [
                'id', 'DESC'
            ]
        })

        if(colors) {
            return {
                EM: "Lấy thông tin tất cả màu thành công!",
                EC: 0,
                DT: colors
            }
        } else {
            return {
                EM: "Không tìm thấy màu nào!",
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

const getColorsWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Color.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            colors: rows,
        }

        return {
            EM: "Lấy thông tin màu thành công!",
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

const setActiveColor = async (id) => {
    try {
        let color = await db.Color.findOne({
            where: {
                id: id
            }
        });

        if(color) {
            await color.update({
                isActive: !color.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy màu!",
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

const updateColor = async (dataColor) => {
    try {
        let color = await db.Color.findOne({
            where: {
                id: dataColor.id
            }
        });

        if(color) {
            await color.update({
                name: dataColor.name,
                code: dataColor.code,
                description: dataColor.description
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy màu!",
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

const deleteColor = async (id) => {
    try {
        let color = await db.Color.destroy({
            where: {
                id: id
            }
        });

        if(color) {
            return {
                EM: `Xóa thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy màu!",
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

module.exports = {
    createColor,
    getAllColors,
    getColorsWithPagination,
    setActiveColor,
    updateColor,
    deleteColor,
}