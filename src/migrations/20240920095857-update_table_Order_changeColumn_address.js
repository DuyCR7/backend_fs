'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Order', 'cusAddressId');

    await queryInterface.addColumn('Order', 'addLocation', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Order', 'addName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Order', 'addPhone', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Order', 'addEmail', {
      type: Sequelize.STRING,
      allowNull: false,
    });
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
    await queryInterface.addColumn('Order', 'cusAddressId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Cus_Address',
        key: 'id',
      },
      allowNull: false,
    });

    // Xóa các cột mới thêm
    await queryInterface.removeColumn('Order', 'addName');
    await queryInterface.removeColumn('Order', 'addLocation');
    await queryInterface.removeColumn('Order', 'addPhone');
    await queryInterface.removeColumn('Order', 'addEmail');
  }
};
