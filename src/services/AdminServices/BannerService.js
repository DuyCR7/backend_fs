import db from "../../models/index";
import { Op } from "sequelize";

const createBanner = async (dataBanner) => {
    try {
        let banner = await db.Banner.findOne({
            where: {
                name: dataBanner.name
            }
        });
    
        if(banner) {
            return {
                EM: "Tên banner đã tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            await db.Banner.create(dataBanner);
            return {
                EM: "Tạo mới banner thành công!",
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

const getBannersWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Banner.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            banners: rows,
        }

        return {
            EM: "Lấy thông tin banner thành công!",
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

const setActiveBanner = async (id) => {
    try {
        let banner = await db.Banner.findOne({
            where: {
                id: id
            }
        });

        if(banner) {
            await banner.update({
                isActive: !banner.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy banner!",
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

const getBannerById = async (id) => {
    try {
        let banner = await db.Banner.findOne({
            where: {
                id: id
            }
        });

        if(banner) {
            return {
                EM: `Lấy thông tin banner thành công!`,
                EC: 0,
                DT: banner,
            }
        } else {
            return {
                EM: "Không tìm thấy banner!",
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

const updateBanner = async (dataBanner) => {
    try {
        let banner = await db.Banner.findOne({
            where: {
                id: dataBanner.id
            }
        });

        if(banner) {
            let checkExistName = await db.Banner.findAll({
                where: {
                    name: dataBanner.name,
                    id: { [Op.not]: dataBanner.id }
                }
            });
            
            if(checkExistName.length > 0) {
                return {
                    EM: `Đã tồn tại banner có tên: ${dataBanner.name}!`,
                    EC: -1,
                    DT: ""
                }
            }

            await banner.update({
                name: dataBanner.name,
                image: dataBanner.image,
                url: dataBanner.url,
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy banner!",
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

const deleteBanner = async (id) => {
    try {
        let banner = await db.Banner.destroy({
            where: {
                id: id
            }
        });

        if(banner) {
            return {
                EM: `Xóa thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy banner!",
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

const deleteMany = async (ids) => {
    try {
        await db.Banner.destroy({
            where: {
                id: { [Op.in]: ids }
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
    createBanner,
    getBannersWithPagination,
    setActiveBanner,
    getBannerById,
    updateBanner,
    deleteBanner,
    deleteMany,
}