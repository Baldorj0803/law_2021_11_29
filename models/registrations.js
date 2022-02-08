module.exports = function (sequelize, DataTypes) {
  // Харилцагчийн нэр	Гэрээний товч утга	Дэд код	Дугаар	Гэрээ байгуулсан огноо	Хүчинтэй хугацаа	Дууссан тэмдэглэл	Нэмэлттэй эсэх	Газар, нэгж	Гэрээ хариуцсан ажилтан	Гэрээний дүн
  let Registrations = sequelize.define(
    "registrations",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contractTypeId: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        references: {
          model: "contractTypes",
          key: "id",
        },
      },
      customerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      summery: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      subCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      dateOfContract: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      validDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isFinished: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "0",
      },
      isAdditional: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "0",
      },
      unites: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contractOfficer: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      key: {
        type: DataTypes.VIRTUAL,
        get: function () {
          return this.get("id");
        },
      },
    },
    {
      tableName: "registrations",
      timestamps: true,
    }
  );
  return Registrations;
};
