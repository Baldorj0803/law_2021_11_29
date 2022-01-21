module.exports = function (sequelize, DataTypes) {
  let Menus = sequelize.define('menus', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    _tag: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    orderNo: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      unique: true,
    },
  },
    {
      tableName: "menus",
      timestamps: false,
    });
  return Menus;
};