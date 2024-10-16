'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product_Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product_Image.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  Product_Image.init({
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isMainImage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Product_Image',
  });
  return Product_Image;
};