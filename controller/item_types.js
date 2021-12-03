
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getitem_type = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.item_types, query);

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
  
  const item_types = await req.db.item_types.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item_types,
    pagination,
  });
});



exports.createitem_type = asyncHandler(async (req, res, next) => {

  const newitem_type = await req.db.item_types.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newitem_type,
  });
});


exports.updateitem_type = asyncHandler(async (req, res, next) => {
  let user = await req.db.item_types.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй item_type олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteitem_type = asyncHandler(async (req, res, next) => {
  let item_type = await req.db.item_types.findByPk(req.params.id);

  if (!item_type) {
    throw new MyError(`${req.params.id} id тэй item_type олдсонгүй.`, 400);
  }

  await item_type.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item_type,
  });
});