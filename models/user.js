const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
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
        unique: true,
      },
      password: {
        allowNull: false,
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
      resetPasswordToken: {
        type: DataTypes.STRING,
        defaultValue: null
      },
      resetPasswordExpire: {
        type: DataTypes.DATE,
        defaultValue: null
      }
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
  // User.beforeUpdate(async (user, options) => {
  // 	if(user.password){
  // 		const salt = await bcrypt.genSalt(10);
  // 		user.password = await bcrypt.hash(user.password, salt);
  // 	}
  // });

  User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  User.prototype.generatePasswordChangeToken = function () {
    const resetToken = crypto.randomBytes(30).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + process.env.CHANGE_PASSWORD_EXPIRE_MIN * 60 * 1000;

    return resetToken;
  }
  User.prototype.generatePassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
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
