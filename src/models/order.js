'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init({
    cusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Customer',
        key: 'id',
      },
    },
    totalPrice: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    paymentMethod: DataTypes.STRING,
    shippingMethod: DataTypes.STRING,
    cusAddressId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cus_Address',
        key: 'id',
      },
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};