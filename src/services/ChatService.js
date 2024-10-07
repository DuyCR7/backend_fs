import db from "../models/index";
import { Op } from "sequelize";

const createOrGetChat = async (cusId) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'username'],
      include: [
        {
          model: db.Role,
          where: {
            id: 8
          },
          through: { attributes: [] }
        }
      ]
    });
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
      return {
        EM: "Lấy đoạn chat thành công!",
        EC: 0,
        DT: chat,
      }
    } else {
      chat = await db.Chat.create({
        cusId: cusId,
        participants: [...participants],
      });

      return {
        EM: "Tạo đoạn chat thành công!",
        EC: 0,
        DT: chat,
      };
    }

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

const getLastMessage = async (chatId) => {
  try {
    const lastMessage = await db.Message.findOne({
      where: {
        chatId: chatId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (lastMessage) {
      if (lastMessage.productInfo) {
        lastMessage.productInfo = JSON.parse(lastMessage.productInfo);
      }

      return {
        EM: "Lấy tin nhắn cuối cùng thành công!",
        EC: 0,
        DT: lastMessage,
      };
    } else {
      return {
        EM: "Không tìm thấy tin nhắn nào!",
        EC: -1,
        DT: null,
      };
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

const getUnreadMessageCount = async (userId, userType, chatId = null) => {
  try {
    let whereCondition = {
      [Op.and]: [
        {
          [Op.or]: [
            { senderId: { [Op.ne]: userId } },
            { senderType: { [Op.ne]: userType } }
          ]
        },
        db.Sequelize.literal(`NOT JSON_CONTAINS(readBy, JSON_OBJECT('userId', ${userId}, 'userType', '${userType}'))`)
      ]
    };

    if (chatId) {
      whereCondition.chatId = chatId;
    }

    const count = await db.Message.count({
      where: whereCondition,
      include: [{
        model: db.Chat,
        where: userType === 'customer' 
          ? { cusId: userId }
          : db.Sequelize.literal(`JSON_CONTAINS(participants, JSON_OBJECT('id', ${userId}))`)
      }]
    });

    return {
      EM: "Lấy số tin nhắn chưa đọc thành công!",
      EC: 0,
      DT: count,
    };

  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
}

const markMessagesAsRead = async (chatId, userId, userType) => {
  try {
    const messages = await db.Message.findAll({
      where: {
        chatId,
        [Op.not]: { 
          [Op.and]: [
            { senderId: userId },
            { senderType: userType }
          ]
        },
        [Op.and]: [
          db.Sequelize.literal(`NOT JSON_CONTAINS(readBy, JSON_OBJECT('userId', ${userId}, 'userType', '${userType}'))`)
        ]
      }
    });
console.log("messages", messages);
    for (let message of messages) {
      let readBy = JSON.parse(message.readBy);
      
      // Tạo đối tượng user để lưu vào readBy
      let userReadObj = { userId, userType };

      // Kiểm tra nếu đối tượng này chưa có trong readBy
      const isRead = readBy.some(user => user.userId === userId && user.userType === userType);

      if (!isRead) {
        // Thêm đối tượng userReadObj vào readBy
        readBy.push(userReadObj);
        await message.update({ readBy: readBy });
      }
    }

    return {
      EM: "Đánh dấu tin nhắn đã đọc thành công!",
      EC: 0,
      DT: messages.length,
    };

  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
}

const getCurrentChat = async (cusId) => {
  try {
    const chat = await db.Chat.findOne({
      where: {
        cusId: cusId,
      },
    });

    if (!chat) {
      return {
        EM: "Đoạn chat không tồn tại!",
        EC: 1,
        DT: "",
      };
    }

    return {
      EM: "Lấy đoạn chat hiện tại thành công!",
      EC: 0,
      DT: chat.id,
    };

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
  createOrGetChat,
  getAdminChats,
  sendMessage,
  getMessages,
  getLastMessage,
  getUnreadMessageCount,
  markMessagesAsRead,
  getCurrentChat,
};
