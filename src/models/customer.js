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
      Customer.hasOne(models.Cart, {
        foreignKey: 'cusId',
      });
      Customer.belongsToMany(models.Product, { through: 'Wish_List', foreignKey: 'cusId' });
      Customer.hasMany(models.Cus_Address, {foreignKey: 'cusId'});
      Customer.hasMany(models.Order, {foreignKey: 'cusId'});
      Customer.belongsToMany(models.Voucher, { through: 'Voucher_Customer', foreignKey: 'cusId' });
      Customer.hasMany(models.Voucher_Customer, {foreignKey: 'cusId'});
    }
  }
  Customer.init({
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    sex: DataTypes.STRING,
    birthdate: DataTypes.DATEONLY,
    address: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    typeLogin: DataTypes.STRING,
    googleId: DataTypes.STRING,
    tokenLoginGoogle: DataTypes.STRING,
    githubId: DataTypes.STRING,
    tokenLoginGithub: DataTypes.STRING,
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};