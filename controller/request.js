const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const variable = require('../config/const')

exports.getrequests = asyncHandler(async (req, res, next) => {

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  if (!req.query.reqStatusId) {
    throw new MyError(`Төлөв дамжуулна уу`, 400);
  }

  let reqStatusId = await req.db.req_status.findOne({
    where: {
      slug: req.query.reqStatusId.trim()
    },
    attributes: ['id']
  })
  console.log(reqStatusId);
  if (!reqStatusId) {
    throw new MyError(`Төлөв олдсонгүй`, 400);
  }
  let mainQuery = `select r.id, r.createdAt,u.id as sendUser,u.name,u.lastname,u.profession,o.name as gazar,i.name as gereeName,c.name,rs.name,rs.slug ` +
    `from request r ` +
    `left join req_status rs on r.reqStatusId =rs.id ` +
    `left join items i on r.itemId=i.id ` +
    `left join company c on i.company=c.id ` +
    `left join users u on i.userId=u.id ` +
    `left join organizations o on u.organizationId=o.id ` +
    `where r.reqStatusId= ` + reqStatusId.id;
  let isAdmin = await req.db.roles.findOne({
    where: {
      name: 'admin'
    }
  })
  if (!isAdmin) {
    mainQuery = mainQuery + ` r.recieveUser=${req.userId}`
  }
  const [uResult, uMeta] = await req.db.sequelize.query(mainQuery);



  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: uResult,
  });
});

exports.getrequest = asyncHandler(async (req, res, next) => {

  //Өөрт ирсэн хүсэлтийг харах боломжтой учир userId гаар шүүв
  if (!req.params.requestId) {
    throw new MyError(`Хүсэлтийн дугаар байхгүй байна.`, 400);
  }
  let query = `select r.id, c.name as company,i.name as gereeNer,i.file,i.brfMean,i.custInfo,i.wage,i.execTime,i.description,i.warrantyPeriod,i.trmCont,
  u.name,u.mobile,u.profession,o.name as gazarNegj
  from request r
  left join items i on r.itemId = i.id
  left join company c on i.company=c.id
  left join users u on i.userId=u.id
  left join organizations o on u.organizationId=o.id
  where r.id=${req.params.requestId} and r.recieveUser=${req.userId}`

  const [uResult, uMeta] = await req.db.sequelize.query(query);

  if (uResult.length === 0) {
    throw new MyError(`${req.params.id} id тэй хүсэлт олдсонгүй.`, 400);
  }

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: uResult,
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
  console.log(req.body)
  let request = await req.db.request.findOne({
    where: {
      id: req.params.id,
      recieveUser: req.userId
    }
  });

  if (!request) {
    throw new MyError(`${req.params.id} id тэй хүсэлт олдсонгүй.`, 400);
  }

  req.body.reqStatusId = await req.db.req_status.findOne({
    where :{
      slug:req.body.reqStatusId
    }
  })

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
      new_request.workflowTemplateId = await getWorkflowTemplate(req, updated_item, wt.step + 1)
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



exports.downloadRequestFile = asyncHandler(async (req, res, next) => {

  if (!req.params.requestId||!req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let request = await req.db.request.findOne({
    where: {
      id: req.params.requestId,
      recieveUser: req.userId
    }
  })
  if (!request) {
    throw new MyError(`${req.params.fileName} файлыг татах боломжгүй байна`, 400)
  }

  let item = await req.db.items.findOne({
    where: {
      id: request.itemId,
      file: req.params.fileName
    }
  })
  if (!item) {
    throw new MyError(`Файл олдсонгүй`, 400)
  }

  res.download(process.env.FILE_PATH + `/files/${req.params.fileName}`, function (err) {
    if (err) {
      console.log(err);
      res.status(404).end()
    }
  });
});