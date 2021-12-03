
module.exports = function (sequelize, DataTypes) {
    let company  = sequelize.define('company', {
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
            tableName: "company",
            timestamps: true,
        });
    return company;
};