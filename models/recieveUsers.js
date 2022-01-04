module.exports = function (sequelize, DataTypes) {
  let recieveUsers = sequelize.define(
    "recieveUsers",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      requestId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "request",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "NO ACTION",
      },
    },
    {
      tableName: "recieveUsers",
      timestamps: false,
    }
  );
  return recieveUsers;
};
