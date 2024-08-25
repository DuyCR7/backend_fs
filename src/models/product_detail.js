'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product_Detail.belongsTo(models.Product, {
        foreignKey: 'productId',
      });
      Product_Detail.belongsTo(models.Size, {
        foreignKey:'sizeId',
      });
      Product_Detail.belongsTo(models.Color, {
        foreignKey: 'colorId',
      });
      Product_Detail.hasMany(models.Cart_Detail, {
        foreignKey: 'productDetailId',
      });
    }
  }
  Product_Detail.init({
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      }
    },
    sizeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Size',
        key: 'id'
      }
    },
    colorId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Color',
        key: 'id'
      }
    },
    image: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Product_Detail',
  });
  return Product_Detail;
};