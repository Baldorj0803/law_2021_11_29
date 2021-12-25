module.exports = function (sequelize, DataTypes) {
    let Routes = sequelize.define('routes', {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name:{
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      path:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
  
    },
      {
        tableName: "routes",
        timestamps: false,
      });
    return Routes;
  };