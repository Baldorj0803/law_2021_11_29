
module.exports = function (sequelize, DataTypes) {
    let ranges = sequelize.define('ranges', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        min: {
            type: DataTypes.DOUBLE,
            allowNull:true
        },
        max: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
    },
        {
            tableName: "ranges",
            timestamps: true,
        });
    return ranges;
};