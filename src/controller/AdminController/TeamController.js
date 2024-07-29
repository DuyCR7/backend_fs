import teamService from "../../services/AdminServices/TeamService";

const handleCreateTeam = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(200).json({
            EM: 'Vui lòng nhập tên đội bóng!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.file){
        return res.status(200).json({
            EM: 'Vui lòng chọn hình ảnh!',   // error message
            EC: 1,   // error code
            DT: 'image',   // data
        })
    }
    
    let name = req.body.name;
    let image = req.file.filename;

    let dataTeam = {
        name: name,
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
            EM: 'Error form server!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

module.exports = {
    handleCreateTeam
}