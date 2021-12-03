
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getworkflows = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.workflows, query);

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
  
  const workflows = await req.db.workflows.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflows,
    pagination,
  });
});



exports.createworkflow = asyncHandler(async (req, res, next) => {

  const newworkflow = await req.db.workflows.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newworkflow,
  });
});


exports.updateworkflow = asyncHandler(async (req, res, next) => {
  let user = await req.db.workflows.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй workflow олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteworkflow = asyncHandler(async (req, res, next) => {
  let workflow = await req.db.workflows.findByPk(req.params.id);

  if (!workflow) {
    throw new MyError(`${req.params.id} id тэй workflow олдсонгүй.`, 400);
  }

  await workflow.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflow,
  });
});