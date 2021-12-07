
module.exports = function (sequelize, DataTypes) {
    let form_templates  = sequelize.define('form_templates', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull:false,
            unique: true
        },
        userId:{
            type: DataTypes.BIGINT,
            references: {
                model: "users",
                key: "id",
            },
        },
        totalDownload:{
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue:0,
            allowNull: false,
        }
    },
        {
            tableName: "form_templates",
            timestamps: true,
        });
    return form_templates;
};