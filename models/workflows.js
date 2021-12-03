
module.exports = function (sequelize, DataTypes) {
    let workFlows = sequelize.define('workflows', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        },
        rangeId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: {
                model: "ranges",
                key: "id",
              },
        }
    },
        {
            tableName: "workflows",
            timestamps: true,
        });
    return workFlows;
};