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
      permission_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      role_id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
    },
    {
      tableName: "role_has_permissions",
      timestamps: false,
    }
  );
};



