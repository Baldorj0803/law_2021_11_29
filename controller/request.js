const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const variable = require('../config/const')

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
  if (req.body.itemId) {
    throw new MyError(`${req.body.itemId} гэрээний дугаар дамжуулаагүй байна`, 400);
  }
  let item = await req.body.items.findByPk(req.body.itemId);

  if (item) {
    throw new MyError(`${item.id} тай гэрээ олдсонгүй`, 400);
  }

  // //хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
  let new_request = {};
  if (!req.body.workflowId) {
    throw new MyError(message + `Дамжлагын дугаар дамжуулаагүй байна`, 400);
  }

  new_request.itemId = newitem.id;
  //Хүлээгдэж төлөвтэй үүсгэх
  new_request.reqStatusId = 2;
  //Эхний алхам байх бөгөөд аль дамжлагын үйлдэл дээр явж байгааг олох

  //өөрөөс нь багат lvl тэй алхам байвал алгасна
  let step = 2;
  let workflow_template = await req.db.workflow_templates.findOne({
    where: {
      workflowId: newitem.workflowId,
      step,
    },
  });

  // дараагийн үйлдэл нь миний роль оос бага албан тушаалтай хүн хийх бол алгасна
  if (
    workflow_template.roleId >= req.roleId &&
    (workflow_template.organizationId === null ||
      workflow_template.organizationId !== req.orgId)
  ) {
    for (let index = req.roleId; index > workflow_template.roleId;) {
      if (workflow_template.is_last === 1) {
        //err бүх үйлдлийг алгаслаа
        console.log("Бүх үйлдлийг алгаслаа");
        break;
      }
      step++;
      workflow_template = await req.db.workflow_templates.findOne({
        where: {
          workflowId: newitem.workflowId,
          step,
        },
      });
    }
  }

  if (!workflow_template) {
    throw new MyError(
      message + `Workflow template ээс эхний алхамд торирох үйлдэл олдсонгүй`,
      400
    );
  }
  new_request.workflowTemplateId = workflow_template.id;

  if (!workflow_template.organizationId) {
    console.log(workflow_template.roleId + " роль хүртэл давтах");
    console.log(req.roleId + " миний роль");
    let parentId,
      levelId = req.roleId;
    for (let index = req.roleId; index < array.length; index++) {
      if (workflow_template.roleId === levelId) {
        break;
      }
    }
  } else {
    //Нэг org байна /Тэр газрын захирал/
    let recieveUser = await req.db.users.findAll({
      where: {
        organizationId: workflow_template.organizationId,
      },
    });
    if (recieveUser.length === 0) {
      throw new MyError(
        message + `Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`,
        400
      );
    }
    new_request.recieveUser = recieveUser[0].id;
  }

  new_request = await req.db.request.create(new_request);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newrequest,
  });
});

exports.updaterequest = asyncHandler(async (req, res, next) => {
  let msg;
  let request = await req.db.request.findOne({
    where: {
      id: req.params.id,
      recieveUser: req.userId
    }
  });

  if (!request) {
    throw new MyError(`${req.params.id} id тэй хүсэлт олдсонгүй.`, 400);
  }

  req.body.modifiedBy = req.userId;

  let updated_request = await request.update(req.body);


  // ------------- Гэрээний төрлийг өөрчлөх -----------------

  let status = await req.db.req_status.findByPk(updated_request.reqStatusId);
  //хэрэв цуцлах хүсэлт ирвэл гэрээг цуцлагдсан төлөвт оруулах
  let item = await req.db.items.findByPk(updated_request.itemId);

  if (!item) {
    throw new MyError(`${req.params.id} id тэй гэрээ олдсонгүй.`, 400);
  }
  if (status.slug === "CANCELED") {
    item.reqStatusId = variable.CANCELED;
    await item.update(item);
    msg = "Гэрээ цуцлагдлаа";
  } else if (status.slug === "COMPLETED") {
    //хэрэв зөвшөөрсөн хүсэлт ирвэл сүүлийн алхам эсэхийг шалгаад батлагдсан эсэхийг тодорхойлох
    let wt = await req.db.workflow_templates.findOne({
      where: {
        workflow_id: updated_request.workflowTemplateId,
        is_last: 1,
      },
    });
    if (wt) {
      //Сүүлийн алхам батлагдасан
      item.reqStatusId = variable.APPROVED;
      await item.update(item);
    } {
      //Сүүлийх биш байвал төлвийг өөрчлөөд шинэ хүсэлт үүсгэх
      item.reqStatusId = variable.COMPLETED;
      let updated_item = await item.update(item);

      // id, modifiedBy, workflowTemplateId, itemId, responseId, reqStatusId, recieveUser, suggestion, createdAt, updatedAt
      let new_request = {};
      let wt = await req.db.workflow_templates.findOne({
        where: {
          workflow_id: updated_request.workflowTemplateId,
        },
      });
      new_request.workflowTemplateId = await getWorkflowTemplate(req,updated_item, wt.step + 1)
      new_request.itemId = updated_item.id,
        new_request.reqStatusId = variable.PENDING;
      if (new_request.workflowTemplateId) new_request.recieveUser = recieveUser(req, new_request.workflowTemplateId)

      new_request = await req.db.request.create(new_request);
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
