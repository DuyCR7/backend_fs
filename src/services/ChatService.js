import db from "../models/index";
import { Op } from "sequelize";

const createOrUpdateChat = async (cusId) => {
  try {
    const users = await db.User.findAll();
    const participants = users.map((user) => ({
      id: user.id,
      username: user.username,
    }));

    let chat = await db.Chat.findOne({
      where: {
        cusId: cusId,
      },
    });

    if (chat) {
      await chat.update({
        participants: [...participants],
      });
    } else {
      chat = await db.Chat.create({
        cusId: cusId,
        participants: [...participants],
      });
    }

    return {
      EM: "Tạo hoặc cập nhật đoạn chat thành công!",
      EC: 0,
      DT: chat,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const getAdminChats = async (userId) => {
  try {
    const chats = await db.Chat.findAll({
      where: db.Sequelize.literal(
        `JSON_CONTAINS(participants, '{"id": ${userId}}', '$')`
      ),
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: db.Customer,
          attributes: ["id", "email", "image"],
        },
      ],
    });

    return {
      EM: "Lấy danh sách đoạn chat thành công!",
      EC: 0,
      DT: chats,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const sendMessage = async (
  chatId,
  senderId,
  senderType,
  content,
  productId
) => {
  try {
    const chat = await db.Chat.findByPk(chatId);
    if (!chat) {
      return {
        EM: "Đoạn chat không tồn tại!",
        EC: 1,
        DT: "",
      };
    }

    if (senderType === "customer") {
      if (chat.cusId !== senderId) {
        return {
          EM: "Bạn không phải là khách hàng của đoạn chat này!",
          EC: 2,
          DT: "",
        };
      }
    } else if (senderType === "user") {
        const isParticipant = JSON.parse(chat.participants).some(participant => participant.id === senderId);
        if (!isParticipant) {
          return {
            EM: "Bạn không phải là nhân viên tham gia đoạn chat này!",
            EC: 2,
            DT: "",
          };
        }
    } else {
        return {
            EM: "Loại người gửi không hợp lệ!",
            EC: 3,
            DT: "",
        };
    }

    let productInfo = null;
    if (productId) {
      const product = await db.Product.findByPk(productId, {
        attributes: ["id", "name", "price", "price_sale", "isSale", "slug"],
        include: [
          {
            model: db.Product_Image,
            attributes: ["image", "isMainImage"],
          },
        ],
      });

      if (product) {
        productInfo = {
          id: product.id,
          name: product.name,
          price: product.price,
          price_sale: product.price_sale,
          isSale: product.isSale,
          slug: product.slug,
          images: product.Product_Images,
        };
      }
    }

    const newMessage = await db.Message.create({
      chatId: chatId,
      senderId: senderId,
      senderType: senderType,
      content: content,
      productId: productId,
      productInfo: productInfo,
    });

    return {
      EM: "Gửi tin nhắn thành công!",
      EC: 0,
      DT: newMessage,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const getMessages = async (chatId) => {
  try {
    const messages = await db.Message.findAll({
      where: {
        chatId: chatId,
      },
    });

    messages.forEach((message) => {
      if (message.productInfo) {
        message.productInfo = JSON.parse(message.productInfo);
      }
    });

    return {
      EM: "Lấy tin nhắn thành công!",
      EC: 0,
      DT: messages,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

module.exports = {
  createOrUpdateChat,
  getAdminChats,
  sendMessage,
  getMessages,
};
