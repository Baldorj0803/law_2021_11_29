
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getcurrencies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  
  let query = {}

  if (req.query) {
    query.where = req.query;
  }

  const pagination = await paginate(page, limit, req.db.currencies, query);

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

  const currencies = await req.db.currencies.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: currencies,
    pagination,
  });
});



exports.createcurrencies = asyncHandler(async (req, res, next) => {

  const newcurrencies = await req.db.currencies.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newcurrencies,
  });
});


exports.updatecurrencies = asyncHandler(async (req, res, next) => {
  let user = await req.db.currencies.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй currencies олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deletecurrencies = asyncHandler(async (req, res, next) => {
  let currencies = await req.db.currencies.findByPk(req.params.id);

  if (!currencies) {
    throw new MyError(`${req.params.id} id тэй currencies олдсонгүй.`, 400);
  }

  await currencies.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: currencies,
  });
});