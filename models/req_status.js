
module.exports = function (sequelize, DataTypes) {
    let req_status  = sequelize.define('req_status', {
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
            tableName: "req_status",
            timestamps: true,
        });
    return req_status;
};