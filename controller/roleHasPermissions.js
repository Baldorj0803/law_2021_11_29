
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getroleHasPermissions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query={}
  if (req.query) {
    query.where = req.query;
  }

  const pagination = await paginate(page, limit, req.db.roleHasPermissions, query);

   query = { offset: pagination.start - 1, limit };

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
  query.include = [{model:req.db.menus}]
  const roleHasPermissions = await req.db.roleHasPermissions.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: roleHasPermissions,
    pagination,
  });
});



exports.createroleHasPermission = asyncHandler(async (req, res, next) => {

  const newroleHasPermission = await req.db.roleHasPermissions.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newroleHasPermission,
  });
});


exports.updateroleHasPermission = asyncHandler(async (req, res, next) => {
  let user = await req.db.roleHasPermissions.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй roleHasPermission олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteroleHasPermission = asyncHandler(async (req, res, next) => {
  let roleHasPermission = await req.db.roleHasPermissions.findByPk(req.params.id);

  if (!roleHasPermission) {
    throw new MyError(`${req.params.id} id тэй roleHasPermission олдсонгүй.`, 400);
  }

  await roleHasPermission.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: roleHasPermission,
  });
});