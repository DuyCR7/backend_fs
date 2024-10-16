'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Role, {
        through: 'User_Role',
        foreignKey: 'userId',
      });
      User.hasMany(models.Post, {
        foreignKey: 'userId',
      });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: DataTypes.STRING,
    address: DataTypes.STRING,
    sex: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    birthdate: DataTypes.DATEONLY,
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};