const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const variable = require("../config/const");

exports.getMyConfirmFile = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      userId: req.userId,
    },
  });

  if (!item) throw new MyError("Файл олдсонгүй");
  if (!item.confirmFile || item.confirmFile === null)
    throw new MyError("Файл олдсонгүй");

  res.download(
    process.env.FILE_PATH + `/confirmFile/${item.confirmFile}`,
    function (err) {
      if (err) {
        console.log(err);
        res.status(404).end();
      }
    }
  );
});

//Батлгадсан гэрээг татах
exports.getConfirmFile = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      reqStatusId: variable.APPROVED,
    },
  });

  if (!item) throw new MyError("Файл олдсонгүй");
  if (!item.confirmFile || item.confirmFile === null)
    throw new MyError("Файл олдсонгүй");

  res.download(
    process.env.FILE_PATH + `/files/${item.file}`,
    function (err) {
      if (err) {
        console.log(err);
        res.status(404).end();
      }
    }
  );
});

exports.getContractIConfirm = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId || !req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let check = await req.db.request.findOne({
    where: {
      itemId: req.params.itemId,
    },
    include: {
      model: req.db.recieveUsers,
      where: { userId: req.userId }
    }
  });
  if (!check)
    throw new MyError(
      "Та энэ гэрээн дээр хүсэлт аваагүй тул татах боломжгүй байна"
    );
  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
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
exports.getSubFileIConfirm = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId || !req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let check = await req.db.request.findOne({
    where: {
      itemId: req.params.itemId,
    },
    include: {
      model: req.db.recieveUsers,
      where: { userId: req.userId }
    }
  });
  if (!check)
    throw new MyError(
      "Та энэ гэрээн дээр хүсэлт аваагүй тул татах боломжгүй байна"
    );
  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
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


//Миний үүсгэсэн гэрээн дээрх хүсэлтүүдийг файл
exports.downloadMyItemRequestFile = asyncHandler(async (req, res, next) => {


  if (!req.params.requestId || !req.params.file || !req.params.itemId) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let request = await req.db.request.findOne({
    where: {
      itemId: req.params.itemId,
      id: req.params.requestId,
      file: req.params.file,
    }
  })
  if (!request) {
    throw new MyError(`${req.params.file} файлыг татах боломжгүй байна`, 400)
  }
  res.download(process.env.FILE_PATH + `/files/${req.params.file}`, function (err) {
    if (err) {
      console.log(err);
      res.status(404).end()
    }
  });
});
//Миний үүсгэсэн гэрээн дээрх хүсэлтүүдийг нэмэлт файл
exports.downloadMyItemRequestSubFile = asyncHandler(async (req, res, next) => {

  console.log("---------------");

  if (!req.params.requestId || !req.params.file || !req.params.itemId) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let request = await req.db.request.findOne({
    where: {
      itemId: req.params.itemId,
      id: req.params.requestId,
      subFile: req.params.file,
    }
  })
  if (!request) {
    throw new MyError(`${req.params.file} файлыг татах боломжгүй байна`, 400)
  }
  res.download(process.env.FILE_PATH + `/files/${req.params.file}`, function (err) {
    if (err) {
      console.log(err);
      res.status(404).end()
    }
  });
});


exports.downloadRegistrationsFile = asyncHandler(async (req, res, next) => {

  if (!req.params.id) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let registration = await req.db.registrations.findByPk(req.params.id);
  if (!registration) throw new MyError(`${req.params.file} файлыг татах боломжгүй байна`, 400);

  let type = await req.db.contractTypes.findOne({
    where: { id: registration.contractTypeId }
  });

  type = await req.db.contractTypes.findOne({
    where: { id: type.parentId }
  });
  res.download(process.env.FILE_PATH + `/contracts/${type.slug}/${registration.fileName}`, function (err) {
    if (err) res.sendStatus(204);
    if (err) console.log(err);
  });
});

