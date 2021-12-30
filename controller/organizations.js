const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.getorganizations = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query = {};
  if (req.query) {
    query.where = req.query;
  }

  const pagination = await paginate(page, limit, req.db.organizations, query);

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

  const organizations = await req.db.organizations.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: organizations,
    pagination,
  });
});

exports.createorganization = asyncHandler(async (req, res, next) => {
  const neworganization = await req.db.organizations.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: neworganization,
  });
});

exports.updateorganization = asyncHandler(async (req, res, next) => {
  let user = await req.db.organizations.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй organization олдсонгүй.`, 400);
  }

  user = await user.update(req.body);
  //   if (req.body.roleId) {
  //     let cascade = `UPDATE users
  // 		SET roleId=${req.body.roleId}
  // 		WHERE users.organizationId=${req.params.id}`;
  //     await req.db.sequelize.query(cascade);
  //   }
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});

exports.deleteorganization = asyncHandler(async (req, res, next) => {
  let organization = await req.db.organizations.findByPk(req.params.id);

  if (!organization) {
    throw new MyError(`${req.params.id} id тэй organization олдсонгүй.`, 400);
  }

  await organization.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: organization,
  });
});
