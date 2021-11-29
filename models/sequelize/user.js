const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = function (sequelize, DataTypes) {
  let User = sequelize.define('users', {
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
      type: DataTypes.STRING(255)
    },
    mobile: {
      type: DataTypes.STRING(255)
    },
    mobile2: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(255)
    },
    image: {
      type: DataTypes.STRING(255)
    },
    profession: {
      type: DataTypes.STRING(255)
    },
    org_id: {
      type: DataTypes.INTEGER,
    },
    is_active: {
      type: DataTypes.INTEGER,
    },
    email: {
      type: DataTypes.STRING(255)
    },
    email_verified_at: {
      type: DataTypes.DATE,
    },
    password: {
      type: DataTypes.STRING(255)
    },
    last_login_ip: {
      type: DataTypes.STRING(255)
    },
    last_login_date: {
      type: DataTypes.DATE,
    },
    remember_token: {
      type: DataTypes.STRING(255)
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
    {
      tableName: "users",
      timestamps: false,
    }, {
    classMethods: {
      // associate: function(models) {
      //   Todo.belongsTo(models.User);
      // }
    },
  });
  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    console.log(salt, user.password);
    user.password = await bcrypt.hash(user.password, salt);
  });

  User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  }
  User.prototype.getJsonWebToken= function () {
    const token = jwt.sign(
      // { id: this._id, role: this.role },
      {id:this.dataValues.id},
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRESIN,
      }
    );
    return token;
  }
  return User;
};