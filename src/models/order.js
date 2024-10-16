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
      Order.hasMany(models.Order_Detail, {
        foreignKey: 'orderId',
      });
      Order.belongsTo(models.Customer, {
        foreignKey: 'cusId',
      });
      Order.belongsTo(models.Voucher, {
        foreignKey: 'voucherId',
      });
    }
  }
  Order.init({
    cusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customer',
        key: 'id',
      },
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paypalOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    voucherId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Voucher',
        key: 'id',
      },
      allowNull: true,
    },
    appliedDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};