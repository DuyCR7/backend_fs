'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Customer',
      'verified',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }
    )
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('customer', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('customer');
     */
    await queryInterface.removeColumn('Customer', 'verified');
  }
};
