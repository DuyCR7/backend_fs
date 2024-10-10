import teamService from "../../services/AdminServices/TeamService";
import slugify from "slugify";

const handleCreateTeam = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(400).json({
            EM: 'Vui lòng nhập tên đội bóng!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.file){
        return res.status(400).json({
            EM: 'Vui lòng chọn hình ảnh!',   // error message
            EC: 1,   // error code
            DT: 'image',   // data
        })
    }
    
    let name = req.body.name;
    let type = req.body.type;
    let slug = slugify(name, { lower: true, strict: true });
    let image = req.file.filename;

    let dataTeam = {
        name: name,
        type: type,
        slug: slug,
        image: image
    }

    try {
        // create
        let data = await teamService.createTeam(dataTeam);

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

const handleGetTeam = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await teamService.getTeamsWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        } else {
            let data = await teamService.getAllTeams();

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

const handleUpdateTeam = async (req, res) => {
    try {
        if(!req.body.name){
            return res.status(400).json({
                EM: 'Vui lòng nhập tên đội bóng!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        let id = req.body.id;
        let team = await teamService.getTeamById(id);
        if(!team) {
            return res.status(404).json({
                EM: 'Đội bóng không tồn tại!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let name = req.body.name;
        let type = req.body.type;
        let slug = slugify(name, { lower: true, strict: true });
        let image = team.DT.image;
        if(req.file){
            image = req.file.filename;
        }

        let dataTeam = {
            id: id,
            name: name,
            type: type,
            slug: slug,
            image: image
        }
        console.log("dataTeam: ", dataTeam);
        
        // update
        let data = await teamService.updateTeam(dataTeam);

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
        
        let data = await teamService.setActiveTeam(id);

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

const handleDeleteTeam = async (req, res) => {
    try {
        let data = await teamService.deleteTeam(req.body.id);

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
    handleCreateTeam,
    handleGetTeam,
    handleSetActive,
    handleUpdateTeam,
    handleDeleteTeam,
}