const fs = require("fs");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const paginate = require("../utils/paginate");
const path = require('path');
const { ensureDirectoryExistence, copy } = require("../utils/saveFile");

exports.getregistrations = asyncHandler(async (req, res, next) => {
  console.log(req.query)
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query = {}
  let includeQuery = {}
  if (req.query) {
    let key = Object.keys(req.query)
    let value = Object.values(req.query)
    query.where = {}
    key.map((k, i) => {
      console.log("K:", k);
      if (k === 'companyId' || k === 'name') {
        // includeQuery.push({ [k]: value[i] });
        includeQuery = { ...includeQuery, [k]: { [Op.like]: `%${value[i]}%` } }
      } else {
        query.where[k] = {}
        let isArr = value[i].split(' ');
        let isDate = value[i].split(',');
        if (isArr.length > 1) {
          query.where[k] = { [Op.in]: isArr };
        } else if (isDate.length == 2) {
          query.where[k] = { [Op.between]: isDate };
        } else query.where[k] = { [Op.like]: `%${value[i]}%` };
      }
    })
  }



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

  query.include = { model: req.db.contractTypes, ...(Object.keys(includeQuery).length > 0 && { where: includeQuery }), include: { model: req.db.company } }

  console.log("query:", query);
  console.log("includeQuery:", includeQuery);

  let pagination = null;
  if (page && limit) {
    pagination = await paginate(page, limit, req.db.registrations, query);
    query = { ...query, offset: pagination.start - 1, limit };
  }

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
  file.name = `file_${Date.now()}${path.parse(file.name).ext}`;
  file.mv(`./public/contracts/backup/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }
  });
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
  let oldType = null, newType = null
  if (req.body.contractTypeId) {
    oldType = await req.db.contractTypes.findOne({
      where: { id: registration.contractTypeId }
    });
    newType = await req.db.contractTypes.findOne({
      where: { id: req.body.contractTypeId }
    });

    if (!oldType || !newType) throw new MyError("Гэрээний төрөл байхгүй байна", 400);
    oldType = await req.db.contractTypes.findOne({
      where: { id: oldType.parentId }
    });
    newType = await req.db.contractTypes.findOne({
      where: { id: newType.parentId }
    });


    if (!registration) {
      throw new MyError(`${req.params.id} id тэй бүртгэл олдсонгүй.`, 400);
    }

    if (req.files !== null && req.files.fileName) {

      let file = req.files.fileName;
      if (!file.mimetype.endsWith("pdf")) throw new MyError("Та зөвхөн pdf file оруулна уу", 400);

      file.name = `file_${Date.now()}${path.parse(file.name).ext}`;
      file.mv(`./public/contracts/backup/${file.name}`, (err) => {
        if (err) {
          throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
        }
      });

      if (!req.body.number) throw new MyError("Дугаар байхгүй байна", 400);

      let oldPath = `./public/contracts/${oldType.slug}/${registration.fileName}`
      let mimetype = registration.fileName.toString().split(".");
      mimetype = mimetype[mimetype.length - 1]
      let newPath = `./public/contracts/${newType.slug}/${req.body.number}.${mimetype}`

      console.log(oldPath);
      console.log(newPath);

      file.mv(newPath, async (err) => {
        if (err) {
          throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
        } else {
          console.log('success');
          f = `${req.body.number}.${mimetype}`;
          await registration.update({ fileName: f });
        }
      });
      message = message + "Файл амжилттай хуулагдлаа. "

      if (oldPath != newPath) {
        fs.unlink(oldPath, (err) => {
          if (err) {
            throw new MyError("Файлыг устгах явцад алдаа гарлаа", 400);
            // return;
          }
        });
      }

    } else {
      let oldPath = `./public/contracts/${oldType.slug}/${registration.fileName}`
      let mimetype = registration.fileName.toString().split(".");
      mimetype = mimetype[mimetype.length - 1]
      let newPath = `./public/contracts/${newType.slug}/${req.body.number}.${mimetype}`
      console.log(oldPath);
      console.log(newPath);
      if (oldPath != newPath) {
        ensureDirectoryExistence(newPath)

        fs.rename(oldPath, newPath, async function (err) {
          if (err) {
            if (err.code === 'EXDEV') {
              copy()
            } else {
              // callback(err);
              console.log(err);
              throw new MyError("Файлыг устгах явцад алдаа гарлаа", 400);
            }
            return;
          } else {
            console.log('success');
            f = `${req.body.number}.${mimetype}`;
            await registration.update({ fileName: f });
          }
        });
      }
    }

  }
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
    where: { id: registration.contractTypeId }
  });

  if (!contractType) throw new MyError("Гэрээний төрөл сонгогдоогүй байна", 400);
  contractType = await req.db.contractTypes.findOne({
    where: { id: contractType.parentId }
  });

  await registration.destroy();

  fs.unlink(`./public/contracts/${contractType.slug}/${registration.fileName}`, (err) => {
    if (err) {
      // throw new MyError("Файлыг устгах явцад алдаа гарлаа", 400);
      return;
    }
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: registration,
  });
});
