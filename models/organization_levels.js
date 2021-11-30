
module.exports = function (sequelize, DataTypes) {
    let orgLevel = sequelize.define('organization_levels', {
        id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        },
    },
        {
            tableName: "organization_levels",
            timestamps: true,
        });
    return orgLevel;
};