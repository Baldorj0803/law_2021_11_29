const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const path = require("path");
const sequelize = require("sequelize");

exports.getitems = asyncHandler(async (req, res, next) => {
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

  const pagination = await paginate(page, limit, req.db.items, query);

  query = { ...query, offset: pagination.start - 1, limit };

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

  query.include = [{ model: req.db.req_status }];

  const items = await req.db.items.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: items,
    pagination,
  });
});
exports.getItem = asyncHandler(async (req, res, next) => {
  let item = await req.db.items.findByPk(req.params.id);

  if (!item) {
    throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
  }

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item,
  });
});

exports.createitem = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    throw new MyError("Гэрээгээ оруулна уу", 400);
  }
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

  req.body.file = `file_${Date.now()}${path.parse(file.name).ext}`;
  file.name = req.body.file;

  //Тухайн өдрөөр фолдер үүсгэж хадгалах
  let time = new Date();
  time.setHours(time.getHours() + 8);
  let folderName = `${time.getFullYear()}-${time.getMonth()}-${time.getDay()}`;

  file.mv(`./public/${folderName}/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }
  });

  req.body.userId = req.userId;
  req.body.typeId = 1;
  req.body.rangeId = parseInt(req.body.rangeId);
  req.body.company = parseInt(req.body.company);
  const newitem = await req.db.items.create(req.body);

  //хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
  let new_request = {};
  if (!req.body.workflowId) {
    throw new MyError(`Дамжлагын дугаар дамжуулаагүй байна`, 400);
  }

  new_request.workflowId = req.body.workflowId;
  new_request.itemId = newitem.id;
  new_request.reqStatusId = 2;
  new_request.step = 1;

  // sequelize.query("UPDATE users SET y = 42 WHERE x = 12").spread(function(results, metadata) {
  //   // Results will be an empty array and metadata will contain the number of affected rows.
  // })

  let workflow = await req.db.sequelize.query(
    "SELECT * from law.workflow_templates wt where workflowId=$workflowId and step=$step",
    {
      bind: { workflowId: new_request.workflowId, step: new_request.step },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (!workflow[0].organizationId) {
    //Олон org байна /газрын захиралууд/
  } else {
    //Нэг org байна /Тэр газрын захирал/
    let recieveUser = await req.db.users.findAll({
      where: {
        organizationId: workflow[0].organizationId,
      },
    });
    if (recieveUser.length===0) {
      throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
    }
  }

  // Темплэтээс дараагийн алхамын role ийг олох
  //Тухайн role дээр 1 ээс олон хүн байвал харьяалагдах нэгжээрээ тухайн хүнийг олох

  let org = await req.db.organizations.findAll();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    // data: newitem,
    workflow,
  });
});

exports.sendReq = asyncHandler(async (req, res, next) => {
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
