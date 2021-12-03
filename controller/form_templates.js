
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getform_templates = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.form_templates, query);

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
  
  const form_templates = await req.db.form_templates.findAll(query);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: form_templates,
    pagination,
  });
});



exports.createform_template = asyncHandler(async (req, res, next) => {

  const newform_template = await req.db.form_templates.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newform_template,
  });
});


exports.updateform_template = asyncHandler(async (req, res, next) => {
  let user = await req.db.form_templates.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй form_template олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteform_template = asyncHandler(async (req, res, next) => {
  let form_template = await req.db.form_templates.findByPk(req.params.id);

  if (!form_template) {
    throw new MyError(`${req.params.id} id тэй form_template олдсонгүй.`, 400);
  }

  await form_template.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: form_template,
  });
});