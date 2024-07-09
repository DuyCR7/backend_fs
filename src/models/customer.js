'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Customer.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    phone: DataTypes.STRING,
    sex: DataTypes.STRING,
    birthdate: DataTypes.DATEONLY,
    address: DataTypes.STRING,
    image: DataTypes.TEXT,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};