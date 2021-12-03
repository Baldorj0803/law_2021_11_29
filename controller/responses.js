
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getresponses = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.responses, query);

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
  
  const responses = await req.db.responses.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: responses,
    pagination,
  });
});



exports.createresponse = asyncHandler(async (req, res, next) => {

  const newresponse = await req.db.responses.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newresponse,
  });
});


exports.updateresponse = asyncHandler(async (req, res, next) => {
  let user = await req.db.responses.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй response олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteresponse = asyncHandler(async (req, res, next) => {
  let response = await req.db.responses.findByPk(req.params.id);

  if (!response) {
    throw new MyError(`${req.params.id} id тэй response олдсонгүй.`, 400);
  }

  await response.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: response,
  });
});