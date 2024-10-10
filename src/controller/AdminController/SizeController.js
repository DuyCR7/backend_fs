import sizeService from "../../services/AdminServices/SizeService";

const handleCreateSize = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(400).json({
            EM: 'Vui lòng nhập tên size!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.body.code){
        return res.status(400).json({
            EM: 'Vui lòng nhập mã code!',   // error message
            EC: 1,   // error code
            DT: 'code',   // data
        })
    }
    
    let name = req.body.name;
    let code = req.body.code;
    let description = req.body.description ? req.body.description : '';

    let dataSize = {
        name: name,
        code: code,
        description: description,
    }

    try {
        // create
        let data = await sizeService.createSize(dataSize);

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

const handleGetSize = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await sizeService.getSizesWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        } else {
            let data = await sizeService.getAllSizes();

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
        
        let data = await sizeService.setActiveSize(id);

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

const handleUpdateSize = async (req, res) => {
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

        let dataSize = {
            id: id,
            name: name,
            code: code,
            description: description,
        }
        
        // update
        let data = await sizeService.updateSize(dataSize);

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

const handleDeleteSize = async (req, res) => {
    try {
        let data = await sizeService.deleteSize(req.body.id);

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
    handleCreateSize,
    handleGetSize,
    handleSetActive,
    handleUpdateSize,
    handleDeleteSize,
}