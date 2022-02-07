const fs = require("fs");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const path = require('path')

exports.getregistrations = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query = {}
  if (req.query) {
    let key = Object.keys(req.query)
    let value = Object.values(req.query)
    console.log(key, value);
    query.where = {}
    key.map((k, i) => {
      query.where[k] = {}
      query.where[k] = value[i]
    })
  }


  const pagination = await paginate(page, limit, req.db.registrations, query);

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

  query.include = { model: req.db.contractTypes, include: { model: req.db.company } }

  const registrations = await req.db.registrations.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    pagination,
    data: registrations,
  });
});

exports.createregistration = asyncHandler(async (req, res, next) => {
  if (req.files === null || !req.files.fileName) {
    throw new MyError("Та гэрээгээ оруулна уу", 400);
  }

  req.body.number = req.body.number.toString().trim()
  let checkUnique = await req.db.registrations.findOne({
    where: {
      number: req.body.number
    }
  })
  if (checkUnique) throw new MyError("Гэрээний дугаар давхцаж байна", 400)

  let contractType = await req.db.contractTypes.findOne({
    where: { id: req.body.contractTypeId }
  });
  if (!contractType) throw new MyError("Гэрээний төрөл сонгогдоогүй байна", 400);
  contractType = await req.db.contractTypes.findOne({
    where: { id: contractType.parentId }
  });

  let file = req.files.fileName;
  if (!file.mimetype.endsWith("pdf")) throw new MyError("Та зөвхөн pdf file оруулна уу", 400);
  file.name = `${req.body.number}${path.parse(file.name).ext}`;
  file.mv(`./public/contracts/${contractType.slug}/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }
  });

  req.body.fileName = file.name;
  req.body.subCode = parseInt(req.body.subCode);
  const newregistration = await req.db.registrations.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newregistration,
  });
});

exports.updateregistration = asyncHandler(async (req, res, next) => {
  let message = "";
  let registration = await req.db.registrations.findByPk(req.params.id);

  if (!registration) {
    throw new MyError(`${req.params.id} id тэй бүртгэл олдсонгүй.`, 400);
  }

  if (req.files !== null && req.files.fileName) {
    let contractType = await req.db.contractTypes.findOne({
      where: { id: registration.contractTypeId }
    });

    if (!contractType) throw new MyError("Гэрээний төрөл сонгогдоогүй байна", 400);
    contractType = await req.db.contractTypes.findOne({
      where: { id: contractType.parentId }
    });

    let file = req.files.fileName;
    if (!file.mimetype.endsWith("pdf")) throw new MyError("Та зөвхөн pdf file оруулна уу", 400);
    if (req.body.number) registration.number = req.body.number;
    file.name = `${registration.number}${path.parse(file.name).ext}`;
    file.mv(`./public/contracts/${contractType.slug}/${file.name}`, (err) => {
      if (err) {
        throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
      }
    });
    message = message + "Файл амжилттай хуулагдлаа. "

    req.body.fileName = file.name;
  } else if ((req.files === null || !req.files.fileName) && req.body.contractTypeId != registration.contractTypeId && req.body.number) {
    //req.body.contractType != registration.contractType төрөл шалгахгүй нөхцөл ажиллах ёстой
    throw new MyError("Файл оруулна уу", 400);

    // let oldType = await req.db.contractTypes.findOne({
    //   where: { id: req.body.contractType }
    // });
    // let newType = await req.db.contractTypes.findOne({
    //   where: { id: registration.contractType }
    // });

    // if (oldType.parentId !== newType.parentId) {
    //   if (!oldType || !newType) throw new MyError("Гэрээний төрөл байхгүй байна", 400);
    //   oldType = await req.db.contractTypes.findOne({
    //     where: { id: oldType.parentId }
    //   });
    //   newType = await req.db.contractTypes.findOne({
    //     where: { id: newType.parentId }
    //   });
    //   let oldPath = `./public/contracts/${oldType.slug}/${registration.fileName}`
    //   let newPath = `./public/contracts/${newType.slug}/${registration.fileName}`
    //   console.log(oldPath);
    //   console.log(newPath);

    //   fs.rename(oldPath, newPath, function (err) {
    //     if (err) throw err
    //     console.log('Successfully renamed - AKA moved!')
    //   })
    // 
    // }

  }
  console.log(typeof req.body.contractTypeId);
  console.log(req.body.contractTypeId);
  console.log(registration.contractTypeId);
  console.log(typeof registration.contractTypeId);
  if (req.body.subCode) req.body.subCode = parseInt(req.body.subCode);

  registration = await registration.update(req.body);
  message = message + " Амжилттай. "

  res.status(200).json({
    code: res.statusCode,
    message,
    data: registration,
  });
});

exports.deleteregistration = asyncHandler(async (req, res, next) => {
  let registration = await req.db.registrations.findByPk(req.params.id);

  if (!registration) {
    throw new MyError(`${req.params.id} id тэй бүртгэл олдсонгүй.`, 400);
  }


  let contractType = await req.db.contractTypes.findOne({
    where: { id: registration.contractType }
  });

  if (!contractType) throw new MyError("Гэрээний төрөл сонгогдоогүй байна", 400);
  contractType = await req.db.contractTypes.findOne({
    where: { id: contractType.parentId }
  });

  await registration.destroy();

  fs.unlink(`./public/contracts/${contractType.slug}/${registration.fileName}`, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: registration,
  });
});
