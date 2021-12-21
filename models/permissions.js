module.exports = function (sequelize, DataTypes) {
  let Roles = sequelize.define('permissions', {
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
    route: {
      type: DataTypes.STRING(100)
    },
    
  },
    {
      tableName: "permissions",
      timestamps: false,
    });
  return Roles;
};