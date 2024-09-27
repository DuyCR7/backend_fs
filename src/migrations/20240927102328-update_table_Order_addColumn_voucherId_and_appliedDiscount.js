'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Order', 'voucherId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Voucher',
        key: 'id',
      },
      allowNull: true
    });

    await queryInterface.addColumn('Order', 'appliedDiscount', {
      type: Sequelize.INTEGER,
      allowNull: true
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
    await queryInterface.removeColumn('Order', 'voucherId');
    await queryInterface.removeColumn('Order', 'appliedDiscount');
  }
};
