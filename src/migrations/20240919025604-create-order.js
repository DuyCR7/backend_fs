'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Order', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Customer',
          key: 'id'
        },
        allowNull: false,
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cusAddressId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cus_Address',
          key: 'id'
        },
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
    await queryInterface.dropTable('Order');
  }
};