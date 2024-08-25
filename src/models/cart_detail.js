'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart_Detail.belongsTo(models.Cart, {
        foreignKey: 'cartId',
      });
      Cart_Detail.belongsTo(models.Product, {
        foreignKey: 'productId',
      });
      Cart_Detail.belongsTo(models.Product_Detail, {
        foreignKey: 'productDetailId',
      });
      
    }
  }
  Cart_Detail.init({
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cart',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product',
        key: 'id',
      },
    },
    productDetailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product_Detail',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
    }
  }, {
    sequelize,
    modelName: 'Cart_Detail',
  });
  return Cart_Detail;
};