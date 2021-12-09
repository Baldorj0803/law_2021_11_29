module.exports = function (sequelize, DataTypes) {
  let request = sequelize.define(
    "items",
    {
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
      itemTypeId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "item_types",
          key: "id",
        },
        defaultValue: 1,
      },
      file: {
        type: DataTypes.STRING,
      },
      company: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
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
        allowNull: false,
        references: {
          model: "workflows",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.BIGINT,
        references: {
          model: "users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "status",
          key: "id",
        },
        defaultValue: 1,
      },
      //харилцагчийн мэдээлэл
      custInfo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      //товч утга
      brfMean: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      //ажлын хөлс
      wage: {
        type: DataTypes.INTEGER(10).UNSIGNED,
      },
      //Гүйцэтгэх хугацаа
      execTime: {
        type: DataTypes.STRING(255),
      },
      //Баталгаат хугацаатай эсэх
      warrantyPeriod: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "0",
      },
      //Торгууль гэрээ цуцлах нөхцөл
      trmCont: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "0",
      },
      recieveUser:{
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: "req_status",
          key: "id",
        },
      },
    },
    {
      tableName: "items",
      timestamps: true,
    }
  );
  return request;
};
