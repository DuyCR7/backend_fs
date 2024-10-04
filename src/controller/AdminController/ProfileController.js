import profileService from "../../services/AdminServices/ProfileService";
import moment from "moment";

const handleGetProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        let data = await profileService.getProfile(userId);
        
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

const handleUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let address = req.body.address ? req.body.address : null;
        let username = req.body.username ? req.body.username : null;
        let phone = req.body.phone ? req.body.phone : null;
        let sex = req.body.sex ? req.body.sex : null;
        let birthdate = req.body.birthdate ? req.body.birthdate : null;
        let image = req.file ? req.file.filename : null;
        
        if (birthdate) {
            const birthDate = moment(birthdate, 'YYYY-MM-DD', true);
            if (!birthDate.isValid()) {
                return res.status(200).json({
                    EM: 'Ngày sinh không hợp lệ!',   // error message
                    EC: -1,   // error code
                    DT: '',   // data
                });
            }

            if (birthDate.isAfter(moment())) {
                return res.status(200).json({
                    EM: 'Ngày sinh phải nhỏ hơn ngày hiện tại!',   // error message
                    EC: -1,   // error code
                    DT: '',   // data
                });
            }
        }
        
        let data = await profileService.updateProfile(userId, address, username, phone, sex, birthdate, image);
        
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
    handleGetProfile,
    handleUpdateProfile,
}