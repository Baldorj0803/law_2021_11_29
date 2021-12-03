
module.exports = function (sequelize, DataTypes) {
    let status  = sequelize.define('status', {
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
        slug: {
            type: DataTypes.STRING,
            allowNull:false
        },
    },
        {
            tableName: "status",
            timestamps: true,
        });
    return status;
};