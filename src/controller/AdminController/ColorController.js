import colorService from "../../services/AdminServices/ColorService";

const handleCreateColor = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(400).json({
            EM: 'Vui lòng nhập tên màu!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.body.code){
        return res.status(400).json({
            EM: 'Vui lòng nhập mã màu!',   // error message
            EC: 1,   // error code
            DT: 'code',   // data
        })
    }
    
    let name = req.body.name;
    let code = req.body.code;
    let description = req.body.description ? req.body.description : '';

    let dataColor = {
        name: name,
        code: code,
        description: description,
    }

    try {
        // create
        let data = await colorService.createColor(dataColor);

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

const handleGetColor = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await colorService.getColorsWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        } else {
            let data = await colorService.getAllColors();

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        }
    
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
        
        let data = await colorService.setActiveColor(id);

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

const handleUpdateColor = async (req, res) => {
    try {
        if(!req.body.name){
            return res.status(400).json({
                EM: 'Vui lòng nhập tên đội bóng!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        if(!req.body.code){
            return res.status(400).json({
                EM: 'Vui lòng nhập tên mã code!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        let id = req.body.id;
        let name = req.body.name;
        let code = req.body.code;
        let description = req.body.description ? req.body.description : '';

        let dataColor = {
            id: id,
            name: name,
            code: code,
            description: description,
        }
        
        // update
        let data = await colorService.updateColor(dataColor);

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

const handleDeleteColor = async (req, res) => {
    try {
        let data = await colorService.deleteColor(req.body.id);

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
    handleCreateColor,
    handleGetColor,
    handleSetActive,
    handleUpdateColor,
    handleDeleteColor,
}