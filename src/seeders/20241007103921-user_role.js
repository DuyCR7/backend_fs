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
    await queryInterface.bulkInsert("User_Role", [
      {
        userId: 1,
        roleId: 1,
      },
      {
        userId: 1,
        roleId: 2,
      },
      {
        userId: 1,
        roleId: 3,
      },
      {
        userId: 1,
        roleId: 4,
      },
      {
        userId: 1,
        roleId: 5,
      },
      {
        userId: 1,
        roleId: 6,
      },
      {
        userId: 1,
        roleId: 7,
      },
      {
        userId: 1,
        roleId: 8,
      },
      {
        userId: 1,
        roleId: 9,
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
    await queryInterface.bulkDelete("User_Role", null, {});
  },
};
