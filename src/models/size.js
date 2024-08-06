'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Size extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Size.hasMany(models.Product_Detail, {
        foreignKey: 'sizeId',
      });
    }
  }
  Size.init({
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    description: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Size',
  });
  return Size;
};