
module.exports = function (sequelize, DataTypes) {
    let currencies = sequelize.define('ranges', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        min: {
            type: DataTypes.DOUBLE,
            allowNull:true,
            defaultValue:0
        },
        max: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        currenciesId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "currencies",
                key: "id",
            },
        },
    },
        {
            tableName: "ranges",
            timestamps: true,
        });
    return currencies;
};