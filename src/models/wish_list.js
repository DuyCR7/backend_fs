'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wish_List extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wish_List.belongsTo(models.Product, { foreignKey: 'productId' });
      Wish_List.belongsTo(models.Customer, { foreignKey: 'cusId' });
    }
  }
  Wish_List.init({
    cusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Customer',
        key: 'id'
      },
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Wish_List',
  });
  return Wish_List;
};