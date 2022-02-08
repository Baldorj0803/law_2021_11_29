module.exports = function (sequelize, DataTypes) {
  let ContractTypes = sequelize.define(
    "contractTypes",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      parentId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      companyId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "company",
          key: "id",
        },
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
      }
    },
    {
      tableName: "contractTypes",
      timestamps: false,
    }
  );
  return ContractTypes;
};
