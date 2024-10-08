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
    await queryInterface.bulkInsert("Role", [
      {
        name: "Quản lý banner",
      },
      {
        name: "Quản lý sự kiện",
      },
      {
        name: "Quản lý bài viết",
      },
      {
        name: "Quản lý voucher",
      },
      {
        name: "Quản lý sản phẩm",
      },
      {
        name: "Quản lý đơn hàng",
      },
      {
        name: "Quản lý khách hàng",
      },
      {
        name: "Chăm sóc khách hàng",
      },
      {
        name: "Quản lý admin"
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
    await queryInterface.bulkDelete("Role", null, {});
  },
};
