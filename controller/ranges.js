
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getranges = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.ranges, query);

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
  
  const ranges = await req.db.ranges.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: ranges,
    pagination,
  });
});



exports.createrange = asyncHandler(async (req, res, next) => {

  const newrange = await req.db.ranges.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newrange,
  });
});


exports.updaterange = asyncHandler(async (req, res, next) => {
  let user = await req.db.ranges.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй range олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleterange = asyncHandler(async (req, res, next) => {
  let range = await req.db.ranges.findByPk(req.params.id);

  if (!range) {
    throw new MyError(`${req.params.id} id тэй range олдсонгүй.`, 400);
  }

  await range.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: range,
  });
});