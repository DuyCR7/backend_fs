import db from "../../models/index";

const createTeam = async (dataTeam) => {
    let team = await db.Team.findOne({
        where: {
            name: dataTeam.name
        }
    });

    if(team) {
        return {
            EM: "Tên đội bóng đã tồn tại!",
            EC: -1,
            DT: ""
        }
    } else {
        await db.Team.create(dataTeam);
        return {
            EM: "Tạo mới đội bóng thành công!",
            EC: 0,
            DT: ""
        }
    }
}

module.exports = {
    createTeam
}