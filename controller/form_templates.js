const asyncHandler = require("express-async-handler");
const slug = require("slug");
const path = require("path");
const MyError = require("../utils/myError");
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

  let query = {};

  if (req.query) {
    query.where = req.query;
  }

  const pagination = await paginate(page, limit, req.db.form_templates, query);

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

  const form_templates = await req.db.form_templates.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: form_templates,
    pagination,
  });
});

exports.getform_template = asyncHandler(async (req, res, next) => {
  let template = await req.db.form_templates.findOne({
    where: { fileName: req.params.fileName },
  });
  
  if (!template) {
    throw new MyError("Файл олдсонгүй", 400);
  }
  let path = "D:/project/back/law/public/form-templates";
  template.totalDownload+=1;
  await template.save()
  res.download(path + `/${req.params.fileName}`, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

exports.createform_template = asyncHandler(async (req, res, next) => {
  const file = req.files.file;

  if (
    !file.mimetype.endsWith("document") &&
    !file.mimetype.endsWith("msword") &&
    !file.mimetype.endsWith("pdf")
  ) {
    throw new MyError("Та word эсвэл pdf file upload хийнэ үү", 400);
  }

  if (file.mimetype.endsWith("document") || file.mimetype.endsWith("msword")) {
    if (process.env.MAX_FILE_SIZE_WORD) {
      if (file.size > process.env.MAX_FILE_SIZE_WORD) {
        throw new MyError("Таны файлын хэмжээ их байна", 400);
      }
    }
  }

  if (file.mimetype.endsWith("pdf")) {
    if (process.env.MAX_FILE_SIZE_PDF) {
      if (file.size > process.env.MAX_FILE_SIZE_PDF) {
        throw new MyError("Таны файлын хэмжээ их байна", 400);
      }
    }
  }

  req.body.createdBy = req.userId;
  req.body.fileName = `${slug(req.body.name)}-${Date.now()}${path.parse(file.name).ext}`;;

  file.mv(`./public/form-templates/${req.body.fileName}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }
  });

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
