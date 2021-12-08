
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
            allowNull:true,
            defaultValue:0
        },
        max: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        workflowId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: true,
        },
        currencyId: {
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
    return ranges;
};