const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const variable = require('../config/const')
const path = require('path');
const generateConfirmFile = require('../utils/generateConfirmFile');
const { checkFile } = require("../utils/saveFile");
const { Op } = require('sequelize')

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
  if (!reqStatusId) {
    throw new MyError(`Төлөв олдсонгүй`, 400);
  }
  let mainQuery = `select r.id,ru.userId as recieveUser, r.createdAt,u.id as sendUser,u.name as sendUserName,u.lastname,
  u.profession,o.name as gazar,i.name as gereeName,c.name as companyName,rs.name as statusName,rs.slug ,w.min,w.max,cur.code
  from recieveusers ru
  left join request r on ru.requestId=r.id
  left join req_status rs on r.reqStatusId =rs.id
  left join items i on r.itemId=i.id
  left join workflows w on i.workflowId = w.id
  left join currencies cur on w.currencyId=cur.id
  left join company c on i.company=c.id
  left join users u on i.userId=u.id
  left join organizations o on u.organizationId=o.id
    where r.reqStatusId= ${reqStatusId.id}`
  let isAdmin = await req.db.users.findOne({
    where: { id: req.userId },
    include: [
      {
        model: req.db.roles,
        where: {
          name: "admin"
        }
      }
    ]
  })
  if (!isAdmin) {
    mainQuery = mainQuery + ` and ru.userId=${req.userId} `
  }

  //Хүлээгдэж буй төлөвтэй бол хүсэлтийн modifiedBy нь null байна
  //Бусад /Цуцалсан,Баталсан/ төлөвтэй бол modeifiedBy нь тухайн үйлдэл хийсэн хүний id
  if (reqStatusId.id === variable.PENDING) {
    mainQuery = mainQuery + ` and r.modifiedBy is NULL `
  } else if ([variable.CANCELED, variable.COMPLETED]) {
    mainQuery = mainQuery + ` and r.modifiedBy=${req.userId}`
  } else throw new MyError("Төлөвт тохирох нөхцөл олдсонгүй, Системийн админд хандана уу?");

  const [uResult, uMeta] = await req.db.sequelize.query(mainQuery);


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: uResult,
  });
});

exports.getrequest = asyncHandler(async (req, res, next) => {

  let request = await req.db.request.findByPk(req.params.requestId);
  if (!request) throw new MyError(`${req.params.requestId} id тай хүсэлт олдсонгүй`);
  //Өөрт ирсэн хүсэлтийг харах боломжтой учир userId гаар шүүв

  if (!request.itemId) throw new MyError(`${request.id} тай хүсэлтэнд ямар нэгэн гэрээ байхгүй байна`);

  let query = `select r.id, c.name as company,i.name as gereeNer,i.file,i.brfMean,i.custInfo,i.wage,i.execTime,i.description,i.warrantyPeriod,i.trmCont,
  u.name,u.mobile,u.profession,o.name as gazarNegj,r.modifiedBy ,r.suggestion,w.min,W.max,cur.code as curName,i.id as itemId
  from recieveusers ru
  left join request r on ru.requestId=r.id
  left join items i on r.itemId = i.id
  left join workflows w on i.workflowId=w.id
  left join currencies cur on w.currencyId = cur.id
  left join company c on i.company=c.id
  left join users u on i.userId=u.id
  left join organizations o on u.organizationId=o.id
  where r.id=${req.params.requestId} and ru.userId=${req.userId}`;

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


const createNextReq = asyncHandler(async (item, request, body, itemStatus, req) => {
  let itemBody = { reqStatusId: itemStatus, file: item.file }
  if (itemStatus === variable.CANCELED) {
    itemBody.canceledUser = req.userId;
  }
  let data = {}
  let updatedRequest = await request.update(body);
  let updatedItem = await item.update(itemBody);
  data = { ...data, updatedRequest }
  data = { ...data, updatedItem }
  return data;
})
const createNextReqApproved = asyncHandler(async (item, request, body, itemStatus, msg, req) => {
  //Approved gej vzne
  console.log("approved gej vzne");
  let itemBody = { reqStatusId: itemStatus }

  let data = {}
  console.log(`request:/${request.id}/ ийг update хийлээ`.yellow);
  console.log(`${JSON.stringify(body)}`);
  let updatedRequest = await request.update(body);
  console.log(`item:/${item.id}/ ийг update хийлээ`.yellow);
  console.log(`${JSON.stringify(body)}`);
  let updatedItem = await item.update(itemBody);
  if (itemStatus === variable.APPROVED) {
    let c = await generateConfirmFile(req, item.id);
    console.log("c:", c);
    await item.update({ confirmFile: c });
  }
  data = { ...data, updatedRequest }
  data = { ...data, updatedItem }
  return data;
})

exports.updaterequest = asyncHandler(async (req, res, next) => {
  let file = null, msg = "", data = {}, status, wt;
  if (req.files && req.files.uploadFileName) {
    file = await checkFile(req.files.uploadFileName);
    req.body.uploadFileName = file.name;
  } else req.body.uploadFileName = null;


  req.body.modifiedBy = req.userId;
  let request = await req.db.request.findOne({
    where: {
      id: req.params.id,
      modifiedBy: null,
      reqStatusId: { [Op.ne]: variable.APPROVED },

    },
    include: {
      model: req.db.recieveUsers,
      where: {
        userId: req.userId
      }
    }
  });


  if (!request) throw new MyError(`${req.params.id} id тэй хүсэлт олдсонгүй.`, 400);
  if (request.modifiedBy !== null) console.log(`Энэ бол алдаа шүү`.bgRed);


  status = await req.db.req_status.findOne({
    where: {
      slug: req.body.requestId
    },
  });
  req.body.reqStatusId = status.id;



  // ------------- Гэрээний төрлийг өөрчлөх -----------------
  //хэрэв цуцлах хүсэлт ирвэл гэрээг цуцлагдсан төлөвт оруулах
  let item = await req.db.items.findByPk(request.itemId);

  console.log(`req.body.uploadFileName: ${req.body.uploadFileName}`.bgBlue);
  if (req.files && req.body.uploadFileName) item.file = req.body.uploadFileName;
  console.log(`item.file: ${item.file}`.bgBlue);

  if (!item) throw new MyError(`${req.params.id} id тэй гэрээ олдсонгүй.`, 400);

  if (status.slug === "CANCELED") {

    if (file) file.mv(`./public/files/${file.name}`, (err) => {
      if (err) {
        throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
      }
    });
    data = await createNextReq(item, request, req.body, variable.CANCELED, req)
    msg = "Гэрээ цуцлагдлаа"
  } else if (status.slug === "COMPLETED") {
    //Одоогийн тэмплэйтийг олох
    wt = await req.db.workflow_templates.findOne({
      where: {
        id: request.workflowTemplateId,
      },
    });

    //хэрэв зөвшөөрсөн хүсэлт ирвэл сүүлийн алхам эсэхийг шалгаад батлагдсан эсэхийг тодорхойлох
    if (wt.is_last === 1) {
      console.log('Сүүлийн алхам нөхцөл рүү орлооо'.red);
      if (file) file.mv(`./public/files/${file.name}`, (err) => {
        if (err) {
          throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
        }
      });
      //Сүүлийн алхам батлагдасан
      data = await createNextReqApproved(item, request, req.body, variable.APPROVED, "Гэрээ Батлагдлаа", req)
      msg = "Гэрээ батлагдлаа"
    } else {

      let new_request = {};
      //Дараагийн хүсэлт илгээгдэх темплэйтийг олох
      let obj = await getWorkflowTemplate(req, item, wt.step + 1);

      if (obj === 0) {
        //Сүүлийн алхам гэж үзэх бөгөөд дээр шалгасан болохоор иишээ орно гэж бодохгүй байна
        //Гэхдээ яахав кк
        data = await createNextReqApproved(item, request, req.body, variable.APPROVED, "Гэрээ Батлагдлаа", req)
        msg = "Гэрээ батлагдлаа"
      } else {
        let recieveusers, new_recieveUsers = [];
        new_request.workflowTemplateId = obj.workflowTemplateId;
        console.log("Дараагийн алхамын id:", new_request.workflowTemplateId);
        new_request.itemId = item.id;
        new_request.reqStatusId = variable.PENDING;
        recieveusers = obj.userIds;
        if (obj.workflowTemplateId && !obj.userIds) {
          let useTemplate = await req.db.workflow_templates.findByPk(new_request.workflowTemplateId);
          recieveusers = await recieveUser(req, useTemplate, item);
        }


        if (file) file.mv(`./public/files/${file.name}`, (err) => {
          if (err) {
            throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
          }
        });

        new_request = await req.db.request.create(new_request);
        recieveusers.map(i => {
          new_recieveUsers.push({
            requestId: new_request.id,
            userId: i
          })
        })

        console.log(new_recieveUsers);
        new_recieveUsers = await req.db.recieveUsers.bulkCreate(new_recieveUsers);
        // Шинэ хүсэлт шаардлагтай талбарууд байгаа тул итемийн төлөвийг орж ирсэн төлөв болгож өөрчлөх
        // item.reqStatusId = variable.COMPLETED;
        let updated_item = await item.update({ reqStatusId: variable.PENDING, file: item.file });
        req.body.modifiedBy = req.userId
        request = await request.update(req.body)
        data = { ...data, new_request }
        data = { ...data, updated_item }
        data = { ...data, request }
        data = { ...data, new_recieveUsers }
      }
    }
  }

  res.status(200).json({
    code: res.statusCode,
    message: `${msg}`,
    data,
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

  if (!req.params.requestId || !req.params.fileName) {
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

//Миний үүсгэсэн гэрээн дээрх хүсэлтүүдийг файл
exports.downloadMyItemRequestUploadedFile = asyncHandler(async (req, res, next) => {


  if (!req.params.requestId || !req.params.uploadFileName || !req.params.itemId) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let request = await req.db.request.findOne({
    where: {
      itemId: req.params.itemId,
      id: req.params.requestId,
      uploadFileName: req.params.uploadFileName,
    }
  })
  if (!request) {
    throw new MyError(`${req.params.uploadFileName} файлыг татах боломжгүй байна`, 400)
  }
  res.download(process.env.FILE_PATH + `/files/${req.params.uploadFileName}`, function (err) {
    if (err) {
      console.log(err);
      res.status(404).end()
    }
  });
});