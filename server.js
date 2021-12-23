const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const rfs = require("rotating-file-stream");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const cors = require('cors')
const fileupload = require("express-fileupload");
// Router оруулж ирэх
const organizationLevelsRoutes = require("./routes/organization_levels");
const rolesRoutes = require("./routes/roles");
const permissionsRoutes = require("./routes/permissions");
const statusRoutes = require("./routes/status");
const formTemplatesRoutes = require("./routes/form_templates");
const itemTypesRoutes = require("./routes/item_types");
const companyRoutes = require("./routes/company");
const reqStatusRoutes = require("./routes/req_status");
const organizationsRoutes = require("./routes/organizations");
const roleHasPemissionsRoutes = require("./routes/roleHasPermissions");
const workflowsRoutes = require("./routes/workflows");
const usersRoutes = require("./routes/users");
const workflowTemplatesRoutes = require("./routes/workflow_templates");
const itemsRoutes = require("./routes/items");
const requestRoutes = require("./routes/request");
const currenciesRoutes = require("./routes/currencies");
const dashboardRoutes = require("./routes/dashboard")
const downloadRoutes = require("./routes/download")
const registrationRoutes = require("./routes/registrations")

const injectDb = require("./middleware/injectDb");

// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

const app = express();

var whitelist = [process.env.WHITELIST]
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin)
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

// Body parser
app.use(express.json());
app.use(fileupload({
  createParentPath: true
}));
app.use(cors(corsOptions));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(injectDb(db));
// app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/organizationLevel", organizationLevelsRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/permissions", permissionsRoutes);
app.use("/api/v1/status", statusRoutes);
app.use("/api/v1/formTemplates", formTemplatesRoutes);
app.use("/api/v1/itemTypes", itemTypesRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/reqStatus", reqStatusRoutes);
app.use("/api/v1/organizations", organizationsRoutes);
app.use("/api/v1/roleHasPermissions", roleHasPemissionsRoutes);
app.use("/api/v1/workflows", workflowsRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/workflowTemplates", workflowTemplatesRoutes);
app.use("/api/v1/items", itemsRoutes);
app.use("/api/v1/request", requestRoutes);
app.use("/api/v1/currencies", currenciesRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/download", downloadRoutes);
app.use("/api/v1/registrations", registrationRoutes);

app.use(errorHandler);

// db.user.belongsToMany(db.book, { through: db.comment });
// db.book.belongsToMany(db.user, { through: db.comment });


// db.roles.belongsToMany(db.permissions, { through: db.role_has_permissions });
// db.permissions.belongsToMany(db.roles, { through: db.role_has_permissions });

// db.permissions.hasMany(db.role_has_permissions);
// db.role_has_permissions.belongsTo(db.permissions);

// db.roles.hasMany(db.role_has_permissions);
// db.role_has_permissions.belongsTo(db.roles)

db.roles.hasMany(db.users)
db.users.belongsTo(db.roles);

db.organizations.hasMany(db.users)
db.users.belongsTo(db.organizations);

db.users.hasMany(db.form_templates)
db.form_templates.belongsTo(db.users);

db.req_status.hasMany(db.items);
db.items.belongsTo(db.req_status)

db.items.hasMany(db.request);
db.request.belongsTo(db.items)


db.req_status.hasMany(db.request);
db.request.belongsTo(db.req_status)

db.currencies.hasMany(db.workflows);
db.workflows.belongsTo(db.currencies);

db.company.hasMany(db.workflows);
db.workflows.belongsTo(db.company);

db.users.hasMany(db.items);
db.items.belongsTo(db.users);

db.workflows.hasMany(db.items);
db.items.belongsTo(db.workflows);

db.workflowType.hasMany(db.workflows);
db.workflows.belongsTo(db.workflowType);



db.menus.hasMany(db.roleHasPermissions);
db.roleHasPermissions.belongsTo(db.menus);


db.permissions.hasMany(db.roleHasPermissions);
db.roleHasPermissions.belongsTo(db.permissions);

// db.workflowType.hasMany(db.workflows);
// db.workflows.belongsTo(db.workflowType);

// db.users.hasMany(db.request);
// db.request.belongsTo(db.users);

// db.request.hasMany(db.workflow_templates)
// db.workflow_templates.belongsTo(db.request)

db.sequelize
  .sync()
  // .sync({force:true})
  .then((result) => {
    console.log("sync hiigdlee...");
  })
  .catch((err) => console.log(err));

const server = app.listen(
  process.env.PORT,
  console.log(`Express сэрвэр ${process.env.PORT} порт дээр аслаа... `.bgGreen)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`.underline.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
