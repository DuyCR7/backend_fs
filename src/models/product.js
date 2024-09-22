'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
      });
      Product.belongsTo(models.Team, {
        foreignKey: 'teamId',
      });
      Product.hasMany(models.Product_Image, {
        foreignKey: 'productId',
      });
      Product.hasMany(models.Product_Detail, {
        foreignKey: 'productId',
      });
      Product.hasMany(models.Cart_Detail, {
        foreignKey: 'productId',
      });
      Product.belongsToMany(models.Customer, { through: 'Wish_List', foreignKey: 'productId' });
      Product.hasMany(models.Review, {
        foreignKey: 'productId',
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    price_sale: DataTypes.INTEGER,
    isSale: DataTypes.BOOLEAN,
    isTrending: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Category',
        key: 'id'
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Team',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};