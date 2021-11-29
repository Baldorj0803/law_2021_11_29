
module.exports = function (sequelize, DataTypes) {
  let Roles = sequelize.define('roles', {
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
    description: {
      type: DataTypes.STRING(255)
    },
    guard_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
    {
      tableName: "roles",
      timestamps: true,
    });
  return Roles;
};