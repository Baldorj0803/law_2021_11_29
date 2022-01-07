
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
        min: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0,
        },
        max: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        currencyId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: true,
            references: {
                allowNull: true,
                model: "currencies",
                key: "id",
            },
        },
        companyId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            allowNull: false,
            references: {
                model: "company",
                key: "id",
            },
        },
        workflowTypeId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "workflowType",
                key: "id",
            },
        },
    },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['min', 'max', 'currencyId', 'companyId']
                }
            ]
        },
        {
            tableName: "workflows",
            timestamps: true,
        });
    return workFlows;
};