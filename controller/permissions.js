
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { Op } = require("sequelize");
const { query } = require("express");


exports.getPermissions = asyncHandler(async (req, res, next) => {

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query={}

  query.include ={ model: req.db.role_has_permissions,where :req.query}

  const permissions = await req.db.permissions.findAll(query);
   res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: permissions,
  });
});