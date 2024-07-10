'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Customer',
      'googleId',
      {
        type: Sequelize.STRING,
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
    await queryInterface.removeColumn('Customer', 'googleId')
  }
};
