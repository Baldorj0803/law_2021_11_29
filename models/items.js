
module.exports = function (sequelize, DataTypes) {
    let request = sequelize.define('items', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        typeId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "item_types",
                key: "id",
            },
        },
        price: {
            type: DataTypes.INTEGER,
        },
        file: {
            type: DataTypes.STRING,
        },
        company: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "company",
                key: "id",
            },
        },
        description: {
            type: DataTypes.TEXT,
        },
        workflowId: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "workflows",
                key: "id",
            },
        },
        createdBy: {
            type: DataTypes.BIGINT,
            references: {
                model: "users",
                key: "id",
            },
        },
        status: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            references: {
                model: "status",
                key: "id",  
            },
        },
    },
        {
            tableName: "items",
            timestamps: true,
        });
    return request;
};