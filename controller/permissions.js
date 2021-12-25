
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getPermissions = asyncHandler(async (req, res, next) => {

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query={}

  // query.include ={ model: req.db.Permission_has_permissions,where :req.query}

  const permissions = await req.db.permissions.findAll(query);
   res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: permissions,
  });
});




exports.createPermission = asyncHandler(async (req, res, next) => {

  const newPermission = await req.db.permissions.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newPermission,
  });
});


exports.updatePermission = asyncHandler(async (req, res, next) => {
  let permission = await req.db.permissions.findByPk(req.params.id);

  if (!permission) {
    throw new MyError(`${req.params.id} id тэй Permission олдсонгүй.`, 400);
  }

  permission = await permission.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: permission,
  });
});


exports.deletePermission = asyncHandler(async (req, res, next) => {
  let permission = await req.db.permissions.findByPk(req.params.id);

  if (!permission) {
    throw new MyError(`${req.params.id} id тэй Permission олдсонгүй.`, 400);
  }

  await permission.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: permission,
  });
});