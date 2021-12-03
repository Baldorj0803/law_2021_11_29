
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getcompany = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.company, query);

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
  
  const company = await req.db.company.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: company,
    pagination,
  });
});



exports.createcompany = asyncHandler(async (req, res, next) => {

  const newcompany = await req.db.company.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newcompany,
  });
});


exports.updatecompany = asyncHandler(async (req, res, next) => {
  let user = await req.db.company.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй company олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deletecompany = asyncHandler(async (req, res, next) => {
  let company = await req.db.company.findByPk(req.params.id);

  if (!company) {
    throw new MyError(`${req.params.id} id тэй company олдсонгүй.`, 400);
  }

  await company.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: company,
  });
});