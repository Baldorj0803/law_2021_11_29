const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const path = require("path");

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


  
  file.name = `file_${Date.now()}${path.parse(file.name).ext}`;

  let time=new Date();
  time.setHours(time.getHours()+8)
  let folderName = `${time.getFullYear()}-${time.getMonth()}-${time.getDay()}`
  file.mv(`./public/${folderName}/${file.name}`, (err) => {
  	if (err) {
  		throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
  	}
  });

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
