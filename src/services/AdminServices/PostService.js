import db from "../../models/index";
import { Op } from "sequelize";

const createPost = async (dataPost) => {
    try {
        let post = await db.Post.findOne({
            where: {
                title: dataPost.title
            }
        });
    
        if(post) {
            return {
                EM: "Tiêu đề bài viết đã tồn tại!",
                EC: -1,
                DT: ""
            }
        } else {
            await db.Post.create(dataPost);
            return {
                EM: "Tạo mới bài viết thành công!",
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

const getAllPosts = async () => {
    try {
        let posts = await db.Post.findAll({
            order: [[
                'id', 'DESC'
            ]]
        })

        if(posts) {
            return {
                EM: "Lấy thông tin tất cả bài viết thành công!",
                EC: 0,
                DT: posts
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết nào!",
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

const getPostsWithPagination = async (page, limit, search, sortConfig) => {
    try {
        let offset = (page - 1) * limit;
        let order = [[sortConfig.key, sortConfig.direction]];

        const whereClause = {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
            ]
        };

        const { count, rows } = await db.Post.findAndCountAll({
            where: whereClause,
            order: order,
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            posts: rows,
        }

        return {
            EM: "Lấy thông tin bài viết thành công!",
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

const getPostById = async (id) => {
    try {
        let post = await db.Post.findOne({
            where: {
                id: id
            }
        });

        if(post) {
            return {
                EM: `Lấy thông tin bài viết thành công!`,
                EC: 0,
                DT: post,
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết!",
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

const updatePost = async (dataPost) => {
    try {
        let post = await db.Post.findOne({
            where: {
                id: dataPost.id
            }
        });

        if(post) {
            let checkExistTitle = await db.Post.findAll({
                where: {
                    title: dataPost.title,
                    id: { [Op.not]: dataPost.id }
                }
            });
            
            if(checkExistTitle.length > 0) {
                return {
                    EM: `Đã tồn tại bài viết có tiêu đề: ${dataPost.title}!`,
                    EC: -1,
                    DT: ""
                }
            }

            await post.update({
                title: dataPost.title,
                slug: dataPost.slug,
                image: dataPost.image,
                content: dataPost.content,
                userId: dataPost.userId
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết!",
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

const setActivePost = async (id) => {
    try {
        let post = await db.Post.findOne({
            where: {
                id: id
            }
        });

        if(post) {
            await post.update({
                isActive: !post.isActive
            });

            return {
                EM: `Cập nhật thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết!",
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

const deletePost = async (id) => {
    try {
        let post = await db.Post.destroy({
            where: {
                id: id
            }
        });

        if(post) {
            return {
                EM: `Xóa thành công!`,
                EC: 0,
                DT: "",
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết!",
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

module.exports = {
    createPost,
    getAllPosts,
    getPostsWithPagination,
    getPostById,
    updatePost,
    setActivePost,
    deletePost,
}