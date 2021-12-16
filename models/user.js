const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = function (sequelize, DataTypes) {
	let User = sequelize.define(
		"users",
		{
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING(255),
			},
			lastname: {
				type: DataTypes.STRING(255),
			},
			mobile: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: true,
			},
			phone: {
				type: DataTypes.STRING(255),
			},
			image: {
				type: DataTypes.STRING(255),
			},
			profession: {
				type: DataTypes.STRING(255),
			},
			organizationId: {
				type: DataTypes.BIGINT(20).UNSIGNED,
				allowNull: false,
				references: {
					model: "organizations",
					key: "id",
				},
			},
			status: {
				type: DataTypes.INTEGER(10).UNSIGNED,
				allowNull: false,
				defaultValue: 1,
				references: {
					model: "status",
					key: "id",
				},
			},
			email: {
				type: DataTypes.STRING(255),
				unique:true
			},
			password: {
				allowNull:false,
				type: DataTypes.STRING(255),
			},
			last_login_ip: {
				type: DataTypes.STRING(255),
			},
			roleId: {
				type: DataTypes.INTEGER(10).UNSIGNED,
				allowNull: false,
				references: {
					model: "roles",
					key: "id",
				},
			},
			branchId: {
				type: DataTypes.INTEGER(10).UNSIGNED,
				allowNull: true,
				references: {
					model: "branch",
					key: "id",
				},
			},
		},
		{
			tableName: "users",
			timestamps: true,
		}
	);
	User.beforeCreate(async (user, options) => {
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
	});
	User.beforeUpdate(async (user, options) => {
		if(user.password){
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(user.password, salt);
		}
	});

	User.prototype.checkPassword = async function (password) {
		return await bcrypt.compare(password, this.password);
	};
	User.prototype.getJsonWebToken = function () {
		const token = jwt.sign(
			{
				id: this.dataValues.id,
				roleId: this.dataValues.roleId,
				orgId: this.dataValues.organizationId,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRESIN,
			}
		);
		return token;
	};
	return User;
};
