import db from "../../models/index";
import { Op } from "sequelize";

const createEvent = async (dataEvent) => {
    try {
        let event = await db.Event.findOne({
            where: {
                name: dataEvent.name
            }
        });
    
        if(event) {
            return {
                EM: `Đã tồn tại sự kiện: ${dataEvent.name}!`,
                EC: -1,
                DT: ""
            }
        } else {
            await db.Event.create(dataEvent);
            return {
                EM: "Tạo mới sự kiện thành công!",
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

const getAllEvents = async () => {
    try {
        let events = await db.Event.findAll({
            order: [
                ['updatedAt', 'DESC'],
            ],
            raw: true,
        });

        if(events) {

            return {
                EM: "Lấy thông tin tất cả sự kiện thành công!",
                EC: 0,
                DT: events
            }
        }

        else {
            return {
                EM: "Không tìm thấy sự kiện nào!",
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

const setActiveEvent = async (id) => {
    try {
        let event = await db.Event.findOne({
            where: {
                id: id
            }
        });

        if(event) {
            await event.update({
                isActive: !event.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy sự kiện!",
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

const getEventById = async (id) => {
    try {
        let event = await db.Event.findOne({
            where: {
                id: id
            }
        });

        if(event) {
            return {
                EM: `Lấy thông tin sự kiện thành công!`,
                EC: 0,
                DT: event,
            }
        } else {
            return {
                EM: "Không tìm thấy sự kiện!",
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

const updateEvent = async (dataEvent) => {
    try {
        let event = await db.Event.findOne({
            where: {
                id: dataEvent.id
            }
        });

        if(event) {
            let checkExistName = await db.Event.findAll({
                where: {
                    name: dataEvent.name,
                    id: { [Op.not]: dataEvent.id }
                }
            });
            
            if(checkExistName.length > 0) {
                return {
                    EM: `Đã tồn tại sự kiện có tên: ${dataEvent.name}!`,
                    EC: -1,
                    DT: ""
                }
            }

            await event.update({
                name: dataEvent.name,
                description: dataEvent.description,
                url: dataEvent.url,
                eventDate: dataEvent.eventDate,
                imageDesktop: dataEvent.imageDesktop,
                imageMobile: dataEvent.imageMobile
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy sự kiện!",
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

const deleteEvent = async (id) => {
    try {
        let event = await db.Event.destroy({
            where: {
                id: id
            }
        });

        if(event) {
            return {
                EM: `Xóa thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy sự kiện!",
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
    createEvent,
    getAllEvents,
    setActiveEvent,
    getEventById,
    updateEvent,
    deleteEvent,
}