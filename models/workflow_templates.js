
module.exports = function (sequelize, DataTypes) {
    let work_temp = sequelize.define('workflow_templates', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
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
            charset: 'utf8',
            collate: 'utf8_general_ci',
            defaultValue: null
        },
        role_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 0,
            references: {
                model: "roles",
                key: "id",
            },
        },
        workflow_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 0,
            references: {
                model: "workflows",
                key: "id",
            },
        },
        step: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 0,
        },
        is_last: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            defaultValue: 1,
        },
    },
        {
            tableName: "workflow_templates",
            timestamps: true,
        });
    return work_temp;
};