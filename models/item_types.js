
module.exports = function (sequelize, DataTypes) {
    let item_types  = sequelize.define('item_types', {
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
            tableName: "item_types",
            timestamps: true,
        });
    return item_types;
};