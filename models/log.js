
module.exports = function (sequelize, DataTypes) {
    let log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        message: {
            type: DataTypes.STRING,
        },
        createdBy: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        }

    },
        {
            tableName: "Log",
            timestamps: true,
        });
    return log;
};