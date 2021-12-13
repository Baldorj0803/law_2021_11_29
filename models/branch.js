
module.exports = function (sequelize, DataTypes) {
    let company  = sequelize.define('branch', {
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
    },
        {
            tableName: "branch",
            timestamps: true,
        });
    return company;
};