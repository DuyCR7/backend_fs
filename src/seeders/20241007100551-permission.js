"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("Permission", [
      // banner: 1-6
      {
        url: "/banner/create",
      },
      {
        url: "/banner/read",
      },
      {
        url: "/banner/set-active",
      },
      {
        url: "/banner/update",
      },
      {
        url: "/banner/delete",
      },
      {
        url: "/banner/delete-many",
      },

      // event: 7-11
      {
        url: "/event/create",
      },
      {
        url: "/event/read",
      },
      {
        url: "/event/set-active",
      },
      {
        url: "/event/update",
      },
      {
        url: "/event/delete",
      },

      // post: 12-16
      {
        url: "/post/create",
      },
      {
        url: "/post/read",
      },
      {
        url: "/post/set-active",
      },
      {
        url: "/post/update",
      },
      {
        url: "/post/delete",
      },

      // voucher: 17-20
      {
        url: "/voucher/create",
      },
      {
        url: "/voucher/read",
      },
      {
        url: "/voucher/set-active",
      },
      {
        url: "/voucher/update",
      },

      // product: 21-51
      {
        url: "/team/create",
      },
      {
        url: "/team/read",
      },
      {
        url: "/team/update",
      },
      {
        url: "/team/set-active",
      },
      {
        url: "/team/delete",
      },

      {
        url: "/category/create",
      },
      {
        url: "/category/read",
      },
      {
        url: "/category/update",
      },
      {
        url: "/category/set-active",
      },
      {
        url: "/category/delete",
      },
      {
        url: "/category/get-parent",
      },
      {
        url: "/category/set-home",
      },

      {
        url: "/size/create",
      },
      {
        url: "/size/read",
      },
      {
        url: "/size/update",
      },
      {
        url: "/size/set-active",
      },
      {
        url: "/size/delete",
      },

      {
        url: "/color/create",
      },
      {
        url: "/color/read",
      },
      {
        url: "/color/update",
      },
      {
        url: "/color/set-active",
      },
      {
        url: "/color/delete",
      },

      {
        url: "/product/get-category",
      },
      {
        url: "/product/get-team",
      },
      {
        url: "/product/get-color",
      },
      {
        url: "/product/get-size",
      },
      {
        url: "/product/create",
      },
      {
        url: "/product/update",
      },
      {
        url: "/product/read",
      },
      {
        url: "/product/set-active-field",
      },
      {
        url: "/product/delete",
      },

      // order: 52-53
      {
        url: "/order/read",
      },
      {
        url: "/order/update-status/",
      },

      // customer: 54-56
      {
        url: "/customer/read",
      },
      {
        url: "/customer/lock",
      },
      {
        url: "/customer/unlock",
      },

      // chat: 57-62
      {
        url: "/chat/get-admin-chat",
      },
      {
        url: "/chat/send-message",
      },
      {
        url: "/chat/get-messages/",
      },
      {
        url: "/chat/get-last-message/",
      },
      {
        url: "/chat/get-unread-message-count",
      },
      {
        url: "/chat/mark-messages-as-read",
      },

      // manage admin: 63-67
      {
        url: "/user/get-all-roles",
      },
      {
        url: "/user/create",
      },
      {
        url: "/user/read",
      },
      {
        url: "/user/update",
      },
      {
        url: "/user/set-active",
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Permission", null, {});
  },
};
