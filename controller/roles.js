
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getRoles = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, req.db.roles);

  let query = { offset: pagination.start - 1, limit };

  if (req.query) {
    query.where = req.query;
  }

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
  const roles = await req.db.roles.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: roles,
    pagination,
  });
 });


exports.createRole = asyncHandler(async (req, res, next) => {

  const newRole = await req.db.roles.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newRole,
  });
});


exports.updateRole = asyncHandler(async (req, res, next) => {
  let user = await req.db.roles.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteRole = asyncHandler(async (req, res, next) => {
  let role = await req.db.roles.findByPk(req.params.id);

  if (!role) {
    throw new MyError(`${req.params.id} id тэй role олдсонгүй.`, 400);
  }

  await role.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: role,
  });
});



