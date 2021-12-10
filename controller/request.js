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
  let request = await req.db.request.findOne({
    where:{
      id:req.params.id,
      recieveUser:req.userId
    }
  });

  if (!request) {
    throw new MyError(`${req.params.id} id тэй хүсэлт олдсонгүй.`, 400);
  }

  req.body.modifiedBy = req.userId;

  let updated_request = await request.update(req.body);

  let status = await req.db.req_status.findByPk(updated_request.reqStatusId);
  //хэрэв цуцлах хүсэлт ирвэл гэрээг цуцлагдсан төлөвт оруулах
  let item =await req.db.items.findByPk(updated_request.itemId);

  if (!item) {
    throw new MyError(`${req.params.id} id тэй гэрээ олдсонгүй.`, 400);
  }
  if (status.slug === "CANCELED") {
    item.reqStatusId = 4;
    let updated_item = await item.update(item);
    if (!request) {
      throw new MyError(`${updated_item.id} id тэй гэрээ цуцлагдлаа`, 400);
    }
  } else if (status.slug === "COMPLETED") {
    //хэрэв зөвшөөрсөн хүсэлт ирвэл сүүлийн алхам эсэхийг шалгаад батлагдсан эсэхийг тодорхойлох
    let is_last = await req.db.workflow_templates.findOne({
      where: {
        workflow_id: updated_request.workflowTemplateId,
        is_last: 1,
      },
    });
    if (is_last&&is_last.step===updated_request.step) {
      item.reqStatusId = 5;
      await item.update(item);
    }{
      //Сүүлийх биш байвал төлвийг өөрчлөөд шинэ хүсэлт үүсгэх
      // let new_request
    }
  }

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: request,
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
