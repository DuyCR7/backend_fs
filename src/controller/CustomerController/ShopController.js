import shopService from "../../services/CustomerServices/ShopService";

const handleGetAllInforProduct = async (req, res) => {
    try {

        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 2;
        let filterCategory = req.query.filterCategory ? req.query.filterCategory.split(',') : [];
        let filterTeam = req.query.filterTeam ? req.query.filterTeam.split(',') : [];
        let filterSize = req.query.filterSize ? req.query.filterSize.split(',') : [];
        let filterColor = req.query.filterColor ? req.query.filterColor.split(',') : [];
        let sortOption = req.query.sortOption ? req.query.sortOption : 'default';
        let team = req.query.team || null;

        let data = await shopService.getAllInforProduct(page, limit, filterTeam, filterCategory, filterSize, filterColor, sortOption, team);

        let updatedCategories = await shopService.getCategories(filterTeam, filterSize, filterColor, data.DT.teamId);
        let updatedTeams = await shopService.getTeams(filterCategory, filterSize, filterColor, data.DT.teamId);
        let updatedSizes = await shopService.getSizes(filterCategory, filterTeam, filterColor, data.DT.teamId);
        let updatedColors = await shopService.getColors(filterCategory, filterTeam, filterSize, data.DT.teamId);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: {
                products: data.DT,
                updatedCategories,
                updatedTeams,
                updatedSizes,
                updatedColors
            },   // data
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
    handleGetAllInforProduct,
}