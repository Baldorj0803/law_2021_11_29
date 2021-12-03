
module.exports = function (sequelize, DataTypes) {
    let responses = sequelize.define('responses', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        editedFile: {
            type: DataTypes.STRING,
            allowNull:false
        },
    },
        {
            tableName: "responses",
            timestamps: true,
        });
    return responses;
};