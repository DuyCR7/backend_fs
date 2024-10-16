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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_sale: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isTrending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Category',
        key: 'id'
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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