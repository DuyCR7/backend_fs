'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Team.hasMany(models.Product, {foreignKey: 'teamId'})
    }
  }
  Team.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    slug: DataTypes.STRING,
    type: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};