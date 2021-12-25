module.exports = function (sequelize, DataTypes) {
  let Permissions = sequelize.define('permissions', {
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
    key: {
      type: DataTypes.STRING(255),
      set: function (value) {
        if (typeof value === "String") value.trim();
        this.setDataValue('key', value);
      },

    },
    method: {
      type: DataTypes.STRING(255),
      allowNull: true,
      set: function (value) {
        if (typeof value === "String") value.trim();
        this.setDataValue('method', value);
      },
    },
    route: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
      set: function (value) {
        if (typeof value === "String") value.trim();
        this.setDataValue('route', value);
      },
    },
    menuId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: "menus",
        key: "id",
      },
    },
    roles: {
      type: DataTypes.TEXT,
      defaultValue: null,
      get: function () {
        return JSON.parse(this.getDataValue('roles'));
      },
      set: function (value) {
        this.setDataValue('roles', JSON.stringify(value));
      },
    },
    organizations: {
      type: DataTypes.TEXT,
      defaultValue: null,
      get: function () {
        return JSON.parse(this.getDataValue('organizations'));
      },
      set: function (value) {
        this.setDataValue('organizations', JSON.stringify(value));
      },
    },

  },
    {
      indexes: [
        {
          unique: true,
          fields: ['method', 'route']
        }
      ]
    },
    {
      tableName: "permissions",
      timestamps: false,
    });
  return Permissions;
};