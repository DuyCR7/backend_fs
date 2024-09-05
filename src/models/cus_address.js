'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cus_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cus_Address.belongsTo(models.Customer, {
        foreignKey: 'cusId',
      });
    }
  }
  Cus_Address.init({
    cusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Customer',
        key: 'id',
      },
      allowNull: false,
    },
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    isDefault: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Cus_Address',
  });
  return Cus_Address;
};