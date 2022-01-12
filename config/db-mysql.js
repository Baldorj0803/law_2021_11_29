const Sequelize = require("sequelize");

var db = {};

const sequelize = new Sequelize(
  process.env.SEQUELIZE_DATABASE,
  process.env.SEQUELIZE_USER,
  process.env.SEQUELIZE_USER_PASSWORD,
  {
    host: process.env.SEQUELIZE_HOST,
    port: process.env.SEQUELIZE_PORT,
    dialect: process.env.SEQUELIZE_DIALECT,
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },

    operatorAliases: false,
  }
);

const models = [
  require("../models/roles"),
  require("../models/permissions"),
  require("../models/status"),
  require("../models/form_templates"),
  require("../models/company"),
  require("../models/req_status"),
  require("../models/organizations"),
  require("../models/workflows"),
  require("../models/user"),
  require("../models/workflow_templates"),
  require("../models/items"),
  require("../models/request"),
  require("../models/currencies"),
  require("../models/workflowType"),
  require("../models/registrations"),
  require("../models/menus"),
  require("../models/recieveUsers"),
  require("../models/workfloawOrganizations"),
];

models.forEach((model) => {
  const seqModel = model(sequelize, Sequelize);
  db[seqModel.name] = seqModel;
});

db.sequelize = sequelize;

module.exports = db;
