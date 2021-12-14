module.exports = function (sequelize, DataTypes) {
	let request = sequelize.define(
		"request",
		{
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			modifiedBy: {
				type: DataTypes.BIGINT,
				references: {
					model: "users",
					key: "id",
				},
			},

			workflowTemplateId: {
				type: DataTypes.INTEGER(10).UNSIGNED,
				allowNull: false,
				references: {
					model: "workflow_templates",
					key: "id",
				},
			},
			itemId: {
				type: DataTypes.BIGINT,
				references: {
					model: "items",
					key: "id",
				},
			},
			reqStatusId: {
				type: DataTypes.INTEGER(10).UNSIGNED,
				allowNull: false,
				references: {
					model: "req_status",
					key: "id",
				},
			},
			recieveUser: {
				type: DataTypes.BIGINT,
				references: {
					model: "users",
					key: "id",
				},
			},
			suggestion: {
				type: DataTypes.TEXT,
			},
			uploadFileName: {
				type: DataTypes.STRING,
			},
		},
		// {
		// 	indexes: [
		// 		//Нэг хүн дээр нэг гэрээний хүсэлт олон ирэхгүй
		// 		{
		// 			unique: true,
		// 			fields: ['itemId', 'recieveUser']
		// 		}
		// 	]
		// },
		{
			tableName: "request",
			timestamps: true,
		}
	);
	return request;
};
