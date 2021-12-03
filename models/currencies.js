
module.exports = function (sequelize, DataTypes) {
    let request = sequelize.define('currencies', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255)
        },

        code: {
            type: DataTypes.STRING(5)
        },
        status: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "status",
                key: "id",
            },
        },
        rate: {
            type: DataTypes.FLOAT
        },
    },
        {
            tableName: "currencies",
            timestamps: true,
        });
    return request;
};