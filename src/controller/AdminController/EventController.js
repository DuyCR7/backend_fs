import eventService from "../../services/AdminServices/EventService";

const handleCreateEvent = async (req, res) => {
    // validate
    if(!req.body.name || req.body.name.trim().length === 0){
        return res.status(400).json({
            EM: 'Vui lòng nhập tên sự kiện!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }

    if(!req.body.description){
        return res.status(400).json({
            EM: 'Vui lòng nhập mô tả sự kiện!',   // error message
            EC: 1,   // error code
            DT: 'description',   // data
        })
    }

    if(!req.body.url){
        return res.status(400).json({
            EM: 'Vui lòng nhập đường dẫn sự kiện!',   // error message
            EC: 1,   // error code
            DT: 'url',   // data
        })
    }

    if(!req.body.eventDate){
        return res.status(400).json({
            EM: 'Vui lòng nhập đúng ngày giờ diễn ra sự kiện!',   // error message
            EC: 1,   // error code
            DT: 'eventDate',   // data
        })
    }

    const eventDate = new Date(req.body.eventDate);
    const currentDate = new Date();

    if (isNaN(eventDate.getTime()) || eventDate <= currentDate) {
        return res.status(400).json({
            EM: 'Ngày giờ sự kiện không hợp lệ hoặc đã qua!',
            EC: 1,
            DT: 'eventDate',
        });
    }
    
    if(!req.files['imageDesktop']){
        return res.status(400).json({
            EM: 'Vui lòng chọn hình ảnh desktop!',   // error message
            EC: 1,   // error code
            DT: 'imageDesktop',   // data
        })
    }

    if(!req.files['imageMobile']){
        return res.status(400).json({
            EM: 'Vui lòng chọn hình ảnh mobile!',   // error message
            EC: 1,   // error code
            DT: 'imageMobile',   // data
        })
    }
    
    let name = req.body.name;
    let description = req.body.description;
    let url = req.body.url;
    let imageDesktop = req.files['imageDesktop'][0];
    let imageMobile = req.files['imageMobile'][0];

    let dataEvent = {
        name: name,
        description: description,
        url: url,
        eventDate: eventDate,
        imageDesktop: imageDesktop.filename,
        imageMobile: imageMobile.filename,
    }

    try {
        // create
        let data = await eventService.createEvent(dataEvent);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleGetEvent = async (req, res) => {
    try {
        let data = await eventService.getAllEvents();

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleSetActive = async (req, res) => {
    try {
        let id = req.body.id;
        
        let data = await eventService.setActiveEvent(id);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleUpdateEvent = async (req, res) => {
    try {
        // validate
        if(!req.body.name || req.body.name.trim().length === 0){
            return res.status(400).json({
                EM: 'Vui lòng nhập tên sự kiện!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        if(!req.body.description){
            return res.status(400).json({
                EM: 'Vui lòng nhập mô tả sự kiện!',   // error message
                EC: 1,   // error code
                DT: 'description',   // data
            })
        }

        if(!req.body.url){
            return res.status(400).json({
                EM: 'Vui lòng nhập đường dẫn sự kiện!',   // error message
                EC: 1,   // error code
                DT: 'url',   // data
            })
        }

        if(!req.body.eventDate){
            return res.status(400).json({
                EM: 'Vui lòng nhập đúng ngày giờ diễn ra sự kiện!',   // error message
                EC: 1,   // error code
                DT: 'eventDate',   // data
            })
        }

        const eventDate = new Date(req.body.eventDate);
        const currentDate = new Date();

        if (isNaN(eventDate.getTime()) || eventDate <= currentDate) {
            return res.status(400).json({
                EM: 'Ngày giờ sự kiện không hợp lệ hoặc đã qua!',
                EC: 1,
                DT: 'eventDate',
            });
        }

        let id = req.body.id;
        let event = await eventService.getEventById(id);
        if(!event) {
            return res.status(404).json({
                EM: 'Sự kiện không tồn tại!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let name = req.body.name;
        let description = req.body.description;
        let url = req.body.url;
        let imageDesktop = event.DT.imageDesktop;
        let imageMobile = event.DT.imageMobile;

        if(req.files['imageDesktop']){
            imageDesktop = req.files['imageDesktop'][0].filename;
        }
        
        if(req.files['imageMobile']){
            imageMobile = req.files['imageMobile'][0].filename;
        }
        
        let dataEvent = {
            id: id,
            name: name,
            description: description,
            url: url,
            eventDate: eventDate,
            imageDesktop: imageDesktop,
            imageMobile: imageMobile,
        }

        let data = await eventService.updateEvent(dataEvent);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleDeleteEvent = async (req, res) => {
    try {
        let data = await eventService.deleteEvent(req.body.id);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

module.exports = {
    handleCreateEvent,
    handleGetEvent,
    handleSetActive,
    handleUpdateEvent,
    handleDeleteEvent,
}