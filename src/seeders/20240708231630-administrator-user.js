'use strict';
const bcrypt = require("bcryptjs");

const salt = bcrypt.genSaltSync(10);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await queryInterface.bulkInsert('User', 
      [
        {
          email: 'duy0184666@huce.edu.vn',
          password: bcrypt.hashSync('12345678', salt),
          username: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          image: "avatar.jpg",
        },
      ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('User', null, {});
  }
};
