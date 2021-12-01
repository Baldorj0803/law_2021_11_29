const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const rfs = require("rotating-file-stream");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const cors = require('cors')
// Router оруулж ирэх
const usersRoutes = require("./routes/users");
const rolesRoutes = require("./routes/roles");
const orgRoutes = require("./routes/organizations");
const injectDb = require("./middleware/injectDb");

// Аппын тохиргоог process.env рүү ачаалах
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

const app = express();


// create a write stream (in append mode)
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

var whitelist = ['http://localhost:3000']
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
app.use(cors());
// app.use(cors(corsOptions));
app.use(logger);
app.use(injectDb(db));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/organizations", orgRoutes);
app.use(errorHandler);

// db.user.belongsToMany(db.book, { through: db.comment });
// db.book.belongsToMany(db.user, { through: db.comment });

// db.user.hasMany(db.comment);
// db.comment.belongsTo(db.user);

// db.book.hasMany(db.comment);
// db.comment.belongsTo(db.book);

// db.category.hasMany(db.book);
// db.book.belongsTo(db.category);

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
