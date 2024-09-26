'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Voucher', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING(50),
        unique: true
      },
      discountType: {
        allowNull: false,
        type: Sequelize.ENUM('percentage', 'fixed'),
      },
      discountValue: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      maxDiscountAmount: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      minOrderValue: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isActive: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      usageLimit: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      usedCount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Voucher');
  }
};