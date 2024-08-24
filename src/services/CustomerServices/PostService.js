import db from "../../models/index";
import { Op } from "sequelize";

const getAllPost = async () => {    
    try {
        let posts = await db.Post.findAll({
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'username'],
                }
            ],
            order: [['createdAt', 'DESC']],
        });
        if (posts && posts.length > 0) {
            return {
                EM: "Lấy tất cả bài viết thành công!",
                EC: 0,
                DT: posts
            }
        } else {
            return {
                EM: "Không tìm thấy bài viết nào!",
                EC: -1,
                DT: []
            }
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

const getSinglePost = async (slug) => {
    try {
        const currentPost = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    attributes: ['id', 'username'],
                }
            ],
            order: [['createdAt', 'DESC']],
        })
        
        if(!currentPost) {
            return {
                EM: "Bài viết không tồn tại!",
                EC: -1,
                DT: "not-found",
            }
        }

        const [previousPost, nextPost] = await Promise.all([
            db.Post.findOne({
                where: { createdAt: { [db.Sequelize.Op.lt]: currentPost.createdAt } },
                order: [['createdAt', 'DESC']],
                attributes: ['title', 'slug'],
            }),
            db.Post.findOne({
                where: { createdAt: { [db.Sequelize.Op.gt]: currentPost.createdAt } },
                order: [['createdAt', 'ASC']],
                attributes: ['title', 'slug'],
            }),
        ]);

        return {
            EM: "Lấy thông tin bài viết thành công!",
            EC: 0,
            DT: {
                currentPost,
                previousPost: previousPost ? { title: previousPost.title, slug: previousPost.slug } : null,
                nextPost: nextPost ? { title: nextPost.title, slug: nextPost.slug } : null,
            }
        };

    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

module.exports = {
    getAllPost,
    getSinglePost,
}