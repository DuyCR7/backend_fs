'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Token', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Token', 'verification_code', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Token', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.addColumn('Token', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
    await queryInterface.removeColumn('Token', 'email');
    await queryInterface.removeColumn('Token', 'verification_code');
    await queryInterface.removeColumn('Token', 'expiresAt');
    await queryInterface.removeColumn('Token', 'isVerified');
  }
};
