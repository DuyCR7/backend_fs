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
    await queryInterface.bulkInsert("Role_Permission", [
      // banner: 1-6
      {
        roleId: 1,
        permissionId: 1,
      },
      {
        roleId: 1,
        permissionId: 2,
      },
      {
        roleId: 1,
        permissionId: 3,
      },
      {
        roleId: 1,
        permissionId: 4,
      },
      {
        roleId: 1,
        permissionId: 5,
      },
      {
        roleId: 1,
        permissionId: 6,
      },

      // event: 7-11
      {
        roleId: 2,
        permissionId: 7,
      },
      {
        roleId: 2,
        permissionId: 8,
      },
      {
        roleId: 2,
        permissionId: 9,
      },
      {
        roleId: 2,
        permissionId: 10,
      },
      {
        roleId: 2,
        permissionId: 11,
      },

      // post: 12-16
      {
        roleId: 3,
        permissionId: 12,
      },
      {
        roleId: 3,
        permissionId: 13,
      },
      {
        roleId: 3,
        permissionId: 14,
      },
      {
        roleId: 3,
        permissionId: 15,
      },
      {
        roleId: 3,
        permissionId: 16,
      },

      // voucher: 17-20
      {
        roleId: 4,
        permissionId: 17,
      },
      {
        roleId: 4,
        permissionId: 18,
      },
      {
        roleId: 4,
        permissionId: 19,
      },
      {
        roleId: 4,
        permissionId: 20,
      },

      // product: 21-51
      {
        roleId: 5,
        permissionId: 21,
      },
      {
        roleId: 5,
        permissionId: 22,
      },
      {
        roleId: 5,
        permissionId: 23,
      },
      {
        roleId: 5,
        permissionId: 24,
      },
      {
        roleId: 5,
        permissionId: 25,
      },
      {
        roleId: 5,
        permissionId: 26,
      },
      {
        roleId: 5,
        permissionId: 27,
      },
      {
        roleId: 5,
        permissionId: 28,
      },
      {
        roleId: 5,
        permissionId: 29,
      },
      {
        roleId: 5,
        permissionId: 30,
      },
      {
        roleId: 5,
        permissionId: 31,
      },
      {
        roleId: 5,
        permissionId: 32,
      },
      {
        roleId: 5,
        permissionId: 33,
      },
      {
        roleId: 5,
        permissionId: 34,
      },
      {
        roleId: 5,
        permissionId: 35,
      },
      {
        roleId: 5,
        permissionId: 36,
      },
      {
        roleId: 5,
        permissionId: 37,
      },
      {
        roleId: 5,
        permissionId: 38,
      },
      {
        roleId: 5,
        permissionId: 39,
      },
      {
        roleId: 5,
        permissionId: 40,
      },
      {
        roleId: 5,
        permissionId: 41,
      },
      {
        roleId: 5,
        permissionId: 42,
      },
      {
        roleId: 5,
        permissionId: 43,
      },
      {
        roleId: 5,
        permissionId: 44,
      },
      {
        roleId: 5,
        permissionId: 45,
      },
      {
        roleId: 5,
        permissionId: 46,
      },
      {
        roleId: 5,
        permissionId: 47,
      },
      {
        roleId: 5,
        permissionId: 48,
      },
      {
        roleId: 5,
        permissionId: 49,
      },
      {
        roleId: 5,
        permissionId: 50,
      },
      {
        roleId: 5,
        permissionId: 51,
      },

      // order: 52-53
      {
        roleId: 6,
        permissionId: 52,
      },
      {
        roleId: 6,
        permissionId: 53,
      },

      // customer: 54-56
      {
        roleId: 7,
        permissionId: 54,
      },
      {
        roleId: 7,
        permissionId: 55,
      },
      {
        roleId: 7,
        permissionId: 56,
      },

      // chat: 57-62
      {
        roleId: 8,
        permissionId: 57,
      },
      {
        roleId: 8,
        permissionId: 58,
      },
      {
        roleId: 8,
        permissionId: 59,
      },
      {
        roleId: 8,
        permissionId: 60,
      },
      {
        roleId: 8,
        permissionId: 61,
      },
      {
        roleId: 8,
        permissionId: 62,
      },

      // manage admin: 63-67
      {
        roleId: 9,
        permissionId: 63,
      },
      {
        roleId: 9,
        permissionId: 64,
      },
      {
        roleId: 9,
        permissionId: 65,
      },
      {
        roleId: 9,
        permissionId: 66,
      },
      {
        roleId: 9,
        permissionId: 67,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Role_Permission", null, {});
  },
};
