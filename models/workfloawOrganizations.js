module.exports = function (sequelize, DataTypes) {
  let workflowOrganizations = sequelize.define(
    "workflowOrganizations",
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      organizationId: {
        type: DataTypes.BIGINT(20).UNSIGNED,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
        onDelete: "NO ACTION",
      },
      workflowTemplateId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "workflow_templates",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "workflowOrganizations",
      timestamps: false,
    }
  );
  return workflowOrganizations;
};
