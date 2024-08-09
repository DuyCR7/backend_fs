import db from "../../models/index";
import { Op } from "sequelize";

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
                isActive: true
            },
            order: [[
                'id', 'DESC'
            ]]
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
                'updatedAt', 'DESC'
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

module.exports = {
    getAllBanners,
    getAllTeams,
    getAllParentCategories,
    getNewEvent,
}