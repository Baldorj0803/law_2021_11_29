module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "role_has_permissions",
    {
      id:{
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      permissionId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      roleId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
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
      tableName: "role_has_permissions",
      timestamps: false,
    },
    {
      indexes: [
          {
              unique: true,
              fields: ['permission_id', 'role_id', ]
          }
      ]
  }
  );
};



