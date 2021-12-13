
module.exports = function (sequelize, DataTypes) {
    let organization = sequelize.define('organizations', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        parent_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        roleId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 6,
            references: {
                model: "roles",
                key: "id",
              },
        }
    },
        {
            tableName: "organizations",
            timestamps: true,
        });
    return organization;
};