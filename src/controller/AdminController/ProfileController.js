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
        console.log("req", req.body)
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
                return res.status(400).json({
                    EM: 'Ngày sinh không hợp lệ!',   // error message
                    EC: -1,   // error code
                    DT: '',   // data
                });
            }

            if (birthDate.isAfter(moment())) {
                return res.status(400).json({
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

const handleChangePassword = async (req, res) => {
    try {
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if (!oldPassword) {
            return res.status(400).json({
                EM: 'Vui lòng nhập mật khẩu cũ!',
                EC: 1,
                DT: 'oldPassword',
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                EM: 'Vui lòng nhập mật khẩu mới!',
                EC: 1,
                DT: 'newPassword',
            });
        }

        if (newPassword.includes(' ')) {
            return res.status(400).json({
                EM: 'Mật khẩu không được chứa khoảng trống!',
                EC: 1,
                DT: 'newPassword',
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                EM: 'Mật khẩu tối thiểu phải có 8 ký tự!',
                EC: 1,
                DT: 'newPassword',
            });
        }

        if (!confirmPassword) {
            return res.status(400).json({
                EM: 'Vui lòng xác nhận mật khẩu mới!',
                EC: 1,
                DT: 'confirmPassword',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                EM: 'Mật khẩu xác nhận không đúng!',
                EC: 1,
                DT: 'confirmPassword',
            });
        }

        const userId = req.user.id;
        let data = await profileService.changePassword(userId, oldPassword, newPassword, confirmPassword);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',
            EC: -1,
            DT: '',
        });
    }
}

module.exports = {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword,
}