
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getrole_has_permission = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  if (req.query) {
    query.where = req.query;
  }

  const pagination = await paginate(page, limit, req.db.role_has_permissions, query);

  let query = { offset: pagination.start - 1, limit };

  if (select) {
    query.attributes = select;
  }


  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }
  
  const role_has_permissions = await req.db.role_has_permissions.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: role_has_permissions,
    pagination,
  });
});



exports.createrole_has_permission = asyncHandler(async (req, res, next) => {

  const newrole_has_permission = await req.db.role_has_permissions.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newrole_has_permission,
  });
});


exports.updaterole_has_permission = asyncHandler(async (req, res, next) => {
  let user = await req.db.role_has_permissions.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй role_has_permission олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleterole_has_permission = asyncHandler(async (req, res, next) => {
  let role_has_permission = await req.db.role_has_permissions.findByPk(req.params.id);

  if (!role_has_permission) {
    throw new MyError(`${req.params.id} id тэй role_has_permission олдсонгүй.`, 400);
  }

  await role_has_permission.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: role_has_permission,
  });
});