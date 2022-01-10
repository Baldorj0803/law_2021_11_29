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
    process.env.FILE_PATH + `/confirmFile/${item.confirmFile}`,
    function (err) {
      if (err) {
        console.log(err);
        res.status(404).end();
      }
    }
  );
});

exports.approvedContractPdf = asyncHandler(async (req, res, next) => {
  if (!req.params.itemId || !req.params.fileName) {
    throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
  }

  let item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      approvedFilePDF: req.params.fileName,
    },
  });

  if (!item) throw new MyError("Файл олдсонгүй");
  if (!item.approvedFilePDF || item.approvedFilePDF === null)
    throw new MyError("Файл олдсонгүй");

  res.download(
    process.env.FILE_PATH + `/approvedFilesPdf/${item.approvedFilePDF}`,
    function (err) {
      if (err) {
        res.status(404).end();
      }
    }
  );
});

exports.myApprovedContractPdf = asyncHandler(async (req, res, next) => {
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

  res.download(
    process.env.FILE_PATH + `/approvedFilesPdf/${item.approvedFilePDF}`,
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