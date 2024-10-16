import db from "../../models/index";
import { Op } from "sequelize";

const createTeam = async (dataTeam) => {
    try {
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

const getTeamsWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Team.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            teams: rows,
        }

        return {
            EM: "Lấy thông tin đội bóng thành công!",
            EC: 0,
            DT: data
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

const getTeamById = async (id) => {
    try {
        let team = await db.Team.findOne({
            where: {
                id: id
            }
        });

        if(team) {
            return {
                EM: `Lấy thông tin đội bóng thành công!`,
                EC: 0,
                DT: team,
            }
        } else {
            return {
                EM: "Không tìm thấy đội bóng!",
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

const updateTeam = async (dataTeam) => {
    try {
        let team = await db.Team.findOne({
            where: {
                id: dataTeam.id
            }
        });

        if(team) {
            let checkExistName = await db.Team.findAll({
                where: {
                    name: dataTeam.name,
                    id: { [Op.not]: dataTeam.id }
                }
            });
            
            if(checkExistName.length > 0) {
                return {
                    EM: `Đã tồn tại đội bóng có tên: ${dataTeam.name}!`,
                    EC: -1,
                    DT: ""
                }
            }

            await team.update({
                name: dataTeam.name,
                type: dataTeam.type,
                slug: dataTeam.slug,
                image: dataTeam.image
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy đội bóng!",
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

const setActiveTeam = async (id) => {
    const transaction = await db.sequelize.transaction();

    try {
        let team = await db.Team.findOne({
            where: {
                id: id
            },
            transaction: transaction
        });

        if (team) {
            const newStatus = !team.isActive;

            await team.update({
                isActive: newStatus
            }, {
                transaction: transaction
            });

            // Chỉ cập nhật trạng thái sản phẩm nếu đội bóng bị vô hiệu hóa
            if (newStatus === false) {
                const productsToUpdate = await db.Product.findAll({
                    where: { teamId: team.id },
                    transaction: transaction
                });

                const productIds = productsToUpdate.map(product => product.id);
                console.log("productIds", productIds);

                await db.Product.update(
                    { isActive: false },
                    { where: { id: productIds }, transaction }
                );

                await db.Cart_Detail.destroy({
                    where: { productId: { [Op.in]: productIds } },
                    transaction
                });

            }

            await transaction.commit();

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy đội bóng!",
                EC: 1,
                DT: "",
            }
        }
        
    } catch (e) {
        await transaction.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

const deleteTeam = async (id) => {
    const transaction = await db.sequelize.transaction();
    try {
        const productUsingTeam = await db.Product.findOne({
            where: { teamId: id },
            transaction
        });

        if (productUsingTeam) {
            return {
                EM: "Không thể xóa vì có sản phẩm đang thuộc đội bóng này!",
                EC: -1,
                DT: "",
            };
        }


        await db.Team.destroy({
            where: {
                id: id
            },
            transaction
        });

        await transaction.commit();

        return {
            EM: `Xóa thành công!`,
            EC: 0,
            DT: "",
        }


    } catch (e) {
        await transaction.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: "",
        };
    }
}

module.exports = {
    createTeam,
    getAllTeams,
    getTeamsWithPagination,
    getTeamById,
    updateTeam,
    setActiveTeam,
    deleteTeam,
}