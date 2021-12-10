
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getreq_status = asyncHandler(async (req, res, next) => {
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

  // const pagination = await paginate(page, limit, req.db.req_status, query);

  //  query = { offset: pagination.start - 1, limit };

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

  console.log(query)
  
  const req_status = await req.db.req_status.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: req_status,
    // pagination,
  });
});



exports.createreq_status = asyncHandler(async (req, res, next) => {

  const newreq_status = await req.db.req_status.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newreq_status,
  });
});


exports.updatereq_status = asyncHandler(async (req, res, next) => {
  let user = await req.db.req_status.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй req_status олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deletereq_status = asyncHandler(async (req, res, next) => {
  let req_status = await req.db.req_status.findByPk(req.params.id);

  if (!req_status) {
    throw new MyError(`${req.params.id} id тэй req_status олдсонгүй.`, 400);
  }

  await req_status.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: req_status,
  });
});