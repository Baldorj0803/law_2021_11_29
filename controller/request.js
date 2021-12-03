
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getrequests = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.request, query);

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
  
  const request = await req.db.request.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: request,
    pagination,
  });
});



exports.createrequest = asyncHandler(async (req, res, next) => {

  const newrequest = await req.db.request.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newrequest,
  });
});


exports.updaterequest = asyncHandler(async (req, res, next) => {
  let user = await req.db.request.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй request олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleterequest = asyncHandler(async (req, res, next) => {
  let request = await req.db.request.findByPk(req.params.id);

  if (!request) {
    throw new MyError(`${req.params.id} id тэй request олдсонгүй.`, 400);
  }

  await request.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: request,
  });
});