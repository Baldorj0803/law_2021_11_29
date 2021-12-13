
module.exports = function (sequelize, DataTypes) {
    let workflowType = sequelize.define('workflowType', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique:true
        },
    },
        {
            tableName: "workflowType",
            timestamps: true,
        });
    return workflowType;
};