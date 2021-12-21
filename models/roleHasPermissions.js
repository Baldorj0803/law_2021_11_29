module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "roleHasPermissions",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      permissionId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      menuId: {
        allowNull: false,
        type: DataTypes.INTEGER(10).UNSIGNED,
        references: {
          model: "menus",
          key: "id",
        },
      },
      roles: {
        type: DataTypes.TEXT,
        get: function () {
          return JSON.parse(this.getDataValue('roles'));
        },
        set: function (value) {
          this.setDataValue('roles', JSON.stringify(value));
        },
      },
      organizations: {
        type: DataTypes.TEXT,
        get: function () {
          return JSON.parse(this.getDataValue('organizations'));
        },
        set: function (value) {
          this.setDataValue('organizations', JSON.stringify(value));
        },
      },
    },
    {
      tableName: "roleHasPermissions",
      timestamps: false,
    },
  );
};



