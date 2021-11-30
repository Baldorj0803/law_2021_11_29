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
    description: {
      type: DataTypes.STRING(255)
    },
    route: {
      type: DataTypes.STRING(100)
    },
    isAdd: {
      type:DataTypes.ENUM,
      values:["0","1"],
      defaultValue:"0"
       
    },
    isDelete: {
      type:DataTypes.ENUM,
      values:["0","1"],
      defaultValue:"0"
       
    },
    isEdit: {
      type:DataTypes.ENUM,
      values:["0","1"],
      defaultValue:"0"
       
    },
    isView: {
      type:DataTypes.ENUM,
      values:["0","1"],
      defaultValue:"0"
    },
  },
    {
      tableName: "permissions",
      timestamps: true,
    });
  return Roles;
};