const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const variable = require("../config/const");
const path = require("path");

exports.myApprovedContractPdf = asyncHandler(async (req, res, next) => {
  const item = await req.db.items.findOne({
    where: {
      id: req.params.itemId,
      userId: req.userId,
      reqStatusId: variable.APPROVED,
    },
  });

  if (!item) throw new MyError("Та файл оруулах боломжгүй байна", 400);

  if (!req.files) {
    throw new MyError("Гэрээгээ оруулна уу", 400);
  }

  let file = req.files.file;

  if (!file.mimetype.endsWith("pdf")) {
    throw new MyError("Та pdf file оруулна уу", 400);
  }

  console.log(file.size);

  if (file.mimetype.endsWith("pdf")) {
    if (process.env.MAX_FILE_SIZE_PDF) {
      if (file.size > process.env.MAX_FILE_SIZE_PDF) {
        throw new MyError("Таны файлын хэмжээ их байна", 400);
      }
    }
  }

  file.name = `file_${Date.now()}${path.parse(file.name).ext}`;
  item.approvedFilePDF = file.name;

  file.mv(`./public/approvedFilesPdf/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }
  });
  await item.update({ approvedFilePDF: file.name });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: item,
  });
});
