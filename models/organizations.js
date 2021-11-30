
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
        level_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            references: {
                model: "organization_levels",
                key: "id",
              },
        },
        order: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
    },
        {
            tableName: "organizations",
            timestamps: true,
        });
    return organization;
};