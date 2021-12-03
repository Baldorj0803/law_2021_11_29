
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getorganization_levels = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.organization_levels, query);

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
  query.include = [{ model: req.db.organization_level_has_permissions }]
  const organization_levels = await req.db.organization_levels.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: organization_levels,
    pagination,
  });
});



exports.createorganization_level = asyncHandler(async (req, res, next) => {

  const neworganization_level = await req.db.organization_levels.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: neworganization_level,
  });
});


exports.updateorganization_level = asyncHandler(async (req, res, next) => {
  let user = await req.db.organization_levels.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй organization_level олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteorganization_level = asyncHandler(async (req, res, next) => {
  let organization_level = await req.db.organization_levels.findByPk(req.params.id);

  if (!organization_level) {
    throw new MyError(`${req.params.id} id тэй organization_level олдсонгүй.`, 400);
  }

  await organization_level.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: organization_level,
  });
});