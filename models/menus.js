module.exports = function (sequelize, DataTypes) {
  let Menus = sequelize.define('menus', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name:{
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    to:{
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    _tag:{
      type: DataTypes.STRING(255),
      allowNull: false,
    },

  },
    {
      tableName: "menus",
      timestamps: false,
    });
  return Menus;
};