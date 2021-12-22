module.exports = function (sequelize, DataTypes) {
  // Харилцагчийн нэр	Гэрээний товч утга	Дэд код	Дугаар	Гэрээ байгуулсан огноо	Хүчинтэй хугацаа	Дууссан тэмдэглэл	Нэмэлттэй эсэх	Газар, нэгж	Гэрээ хариуцсан ажилтан	Гэрээний дүн	
  let Registrations = sequelize.define('registrations', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // set(val) {
      //   this.setDataValue(trim(val));
      // }
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dateOfContract: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finishedNote: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isAdditional: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    key:{
      type:DataTypes.VIRTUAL,
      get:function () {
        return this.get('id')
      }
    }
    
  },
    {
      tableName: "registrations",
      timestamps: false,
    });
  return Registrations;
};	
	
