
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getitems = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.items, query);

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
  
  const items = await req.db.items.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: items,
    pagination,
  });
});



exports.createitem = asyncHandler(async (req, res, next) => {

  const newitem = await req.db.items.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newitem,
  });
});


exports.updateitem = asyncHandler(async (req, res, next) => {
  let user = await req.db.items.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteitem = asyncHandler(async (req, res, next) => {
  let item = await req.db.items.findByPk(req.params.id);

  if (!item) {
    throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
  }

  await item.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item,
  });
});