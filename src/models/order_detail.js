'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order_Detail.init({
    orderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Order',
        key: 'id',
      },
      allowNull: false,
    },
    productDetailId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product_Detail',
        key: 'id',
      },
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Order_Detail',
  });
  return Order_Detail;
};