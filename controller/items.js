const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const { saveFIle } = require("../utils/saveFile");
const variable = require("../config/const");
const fs = require("fs");
const { request } = require("express");
const { Op } = require('sequelize');
const email = require('../utils/email')

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
exports.getConfirmedItems = asyncHandler(async (req, res, next) => {
  let query = `SELECT i.id,i.name,i.file,i.trmCont,i.warrantyPeriod,i.approvedFilePDF,i.reqStatusId,i.createdAt,c.name as companyName, u.name as userName,
	o.name as orgName,wt.name as workflowTypeName,wt.id as workflowTypeId,c.id as companyId
	FROM items i 
	left join workflows w on i.workflowId=w.id
	left join workflowtype wt on w.workflowTypeId=wt.id
	left join company c on w.companyId=c.id
	left join users u on i.userId=u.id
	left join organizations o on u.organizationId=o.id
	where i.reqStatusId=5 and i.approvedFilePDF is not null`;
  const [uResult, uMeta] = await req.db.sequelize.query(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: uResult,
  });
});
exports.myItems = asyncHandler(async (req, res, next) => {
  let query = {};
  query.include = [
    { model: req.db.req_status },
    {
      model: req.db.request,
      order: [["createdAt", "DESC"]],
    },
  ];
  query.where = { userId: req.userId };
  const items = await req.db.items.findAll({
    where: { userId: req.userId },
    include: [
      { model: req.db.req_status },
      {
        model: req.db.request,
        include: [
          {
            model: req.db.req_status,
          },
          {
            model: req.db.recieveUsers,
            include: {
              model: req.db.users,
              include: { model: req.db.organizations }
            }
          }
        ],
        order: [["createdAt", "DESC"]],
      },

    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: items,
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
  let msg;
  if (!req.files.file) {
    throw new MyError("Гэрээгээ оруулна уу", 400);
  }
  req.body.file = await saveFIle(req.files.file, "files", null);
  if (req.files.subFile) req.body.subFile = await saveFIle(req.files.subFile, "files", "sub");

  req.body.firstFile = req.body.file;
  req.body.userId = req.userId;
  req.body.typeId = variable.DRAFT;
  req.body.workflowId = parseInt(req.body.workflowId);
  req.body.company = parseInt(req.body.company);
  req.body.reqStatusId = variable.DRAFT;
  const newitem = await req.db.items.create(req.body);
  msg = "Файл амжилттай хадгалагдлаа. ";

  //хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
  let new_request = {};
  let obj = await getWorkflowTemplate(req, newitem, 1);
  if (obj === 0) {
    newitem.typeId = variable.PENDING;
    await newitem.save();
    res.status(200).json({
      code: res.statusCode,
      message: "Дараагийн алхам байхгүй" + message,
      data: {
        newitem,
      },
    });
  }
  new_request.workflowTemplateId = obj.workflowTemplateId;
  new_request.itemId = newitem.id;
  new_request.reqStatusId = variable.PENDING;

  let new_recieveUsers = [];
  let recieveusers;
  if (!obj.userIds) {
    let useTemplate = await req.db.workflow_templates.findByPk(obj.workflowTemplateId);
    if (new_request.workflowTemplateId)
      recieveusers = await recieveUser(req, useTemplate, newitem);
    //Хүлээн авах хэрэглэгчидээр recieveUsers үүсгэх
  } else recieveusers = obj.userIds;

  new_request = await req.db.request.create(new_request);

  recieveusers.map(i => {
    new_recieveUsers.push({
      requestId: new_request.id,
      userId: i
    })
  })

  console.log(new_recieveUsers);
  new_recieveUsers = await req.db.recieveUsers.bulkCreate(new_recieveUsers);


  msg = msg + "Хүсэлт дараагийн шатанд амжилттай илгээгдлээ";
  newitem.reqStatusId = variable.PENDING;
  await newitem.save();



  let userEmail = await req.db.users.findAll({
    where: {
      id: { [Op.in]: recieveusers },
    },
    attributes: ['email'],
    raw: true
  })
  if (userEmail.length > 0) {
    userEmail.map(async u => {
      if (u.email) {
        let info = await email({
          subject: 'Хуулийн гэрээ байгуулах тухай',
          to: u.email,
        })
        console.log(`${JSON.stringify(info.accepted)} хэрэглэгчид емэйл илгээгдлээ`.green);
      }
    })
  }



  res.status(200).json({
    code: res.statusCode,
    message: `${msg}`,
    data: {
      newitem,
      new_request,
      new_recieveUsers
    },
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
//Цуцлагдсан хүсэлтийг дахин илгээхэд ашиглагдана
exports.updateitem = asyncHandler(async (req, res, next) => {
  console.log(req.files);
  let msg = "";
  if (!req.files.file) {
    throw new MyError("Гэрээгээ оруулна уу", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      userId: req.userId,
      reqStatusId: variable.CANCELED
    },
  });
  let request = await req.db.request.findOne({
    where: {
      id: req.params.requestId,
      reqStatusId: variable.CANCELED,
      modifiedBy: { [Op.ne]: null }
    },
  });

  if (!item) throw new MyError(`${req.params.itemId} id тэй item олдсонгүй.`, 400);

  if (!request) throw new MyError(`${req.params.requestId} id тэй request олдсонгүй.`, 400);

  req.body.file = await saveFIle(req.files.file, "files", null);
  if (req.files.subFile) req.body.subFile = await saveFIle(req.files.subFile, "files", "sub");

  req.body.firstFile = req.body.file;
  req.body.reqStatusId = variable.PENDING;
  req.body.canceledUser = null;
  console.log("Шинэ файл:", req.body.file);
  console.log("Шинэ файл:", req.body.subFile);
  let removeItemFile = item.file;
  let removeItemSubFile;
  //Хэрвээ дахин илгээхдээ нэмэлт файл оруулсан бол өмнөх гэрээний файлыг утсгана
  if (req.body.subFile) removeItemSubFile = item.file;

  updatedItem = await item.update(req.body);

  if (removeItemFile && removeItemFile != "") {
    console.log("Өмнөх файл:", removeItemFile);
    fs.unlink(`./public/files/${removeItemFile}`, (err) => {
      if (err) {
        msg = ", Гэрээний өмнөх файл олдсонгүй";
        console.error(err);
        return;
      }
      msg = msg + ", Гэрээний өмнөх файлыг устгалаа";
    });
  } else msg = "Устгах файл байхгүй байна";

  if (removeItemSubFile && removeItemSubFile != "") {
    console.log("Өмнөх нэмэлт файл:", removeItemSubFile);
    fs.unlink(`./public/files/${removeItemSubFile}`, (err) => {
      if (err) {
        msg = ", Гэрээний өмнөх нэмэлт файл олдсонгүй";
        console.error(err);
        return;
      }
      msg = msg + ", Гэрээний өмнөх нэмэлт файлыг устгалаа";
    });
  }
  //-----------------request ийн файл устгах
  if (request.file && request.file != "") {
    fs.unlink(`./public/files/${request.file}`, (err) => {
      if (err) {
        msg = ", Цуцалсан хүсэлтийн файлыг олдсонгүй";
        console.error(err);
        return;
      }
      msg = msg + ", Цуцалсан хүсэлтийн нэмэлт файлыг устгалаа";
    });
  }
  if (request.subFile && request.subFile != "") {
    fs.unlink(`./public/files/${request.subFile}`, (err) => {
      if (err) {
        msg = ", Цуцалсан хүсэлтийн нэмэлт файл олдсонгүй";
        console.error(err);
        return;
      }
      msg = msg + ", Цуцалсан хүсэлтийн нэмэлт файлыг устгалаа";
    });
  }


  //Шинээр дараагийн хүсэлт бэлдэх

  let requestBody = {
    modifiedBy: null,
    reqStatusId: variable.PENDING,
    suggestion: null,
    file: null,
    subFile: null,
  };
  updatedReq = await request.update(requestBody);

  res.status(200).json({
    code: res.statusCode,
    message: "success" + msg,
    data: {
      updatedItem,
      updatedReq,
    },
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
    message: "success" + msg,
    data: item,
  });
});

exports.downloadMyItemFile = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId || !req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      userId: req.userId,
      file: req.params.fileName,
    },
  });
  if (!item) {
    throw new MyError(
      `${req.params.fileName} файлыг татах боломжгүй байна`,
      400
    );
  }

  res.download(
    process.env.FILE_PATH + `/files/${req.params.fileName}`,
    function (err) {
      if (err) {
        console.log(err);
        res.status(404).end();
      }
    }
  );
});
exports.downloadMyItemSubFile = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId || !req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      userId: req.userId,
      subFile: req.params.fileName,
    },
  });
  if (!item) {
    throw new MyError(
      `${req.params.fileName} файлыг татах боломжгүй байна`,
      400
    );
  }

  res.download(
    process.env.FILE_PATH + `/files/${req.params.fileName}`,
    function (err) {
      if (err) {
        console.log(err);
        res.status(404).end();
      }
    }
  );
});



exports.getMyItemByRequest = asyncHandler(async (req, res, next) => {
  let request = await req.db.request.findByPk(req.params.requestId);

  if (!request) {
    throw new MyError(`${req.params.requestId} id тэй хүсэлт олдсонгүй.`, 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: request.itemId,
      userId: req.userId,
    },
  });

  if (!item) {
    throw new MyError(`${request.itemId} id тэй гэрээ олдсонгүй.`, 400);
  }

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item,
  });
});
