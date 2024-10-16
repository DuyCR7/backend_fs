'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'Customer',
      'image',
      {
        type: Sequelize.STRING,
        allowNull: false,
      }
    )
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn(
      'Customer',  // Tên bảng
      'image', // Tên cột cần thay đổi kiểu dữ liệu
      {
        type: Sequelize.TEXT, // Kiểu dữ liệu cũ
      }
    );
  }
};
