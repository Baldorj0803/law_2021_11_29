
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getcompany = asyncHandler(async (req, res, next) => {
  
  const company = await req.db.company.findAll();


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: company,
  });
});



exports.createcompany = asyncHandler(async (req, res, next) => {

  const newcompany = await req.db.company.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newcompany,
  });
});


exports.updatecompany = asyncHandler(async (req, res, next) => {
  let user = await req.db.company.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй company олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deletecompany = asyncHandler(async (req, res, next) => {
  let company = await req.db.company.findByPk(req.params.id);

  if (!company) {
    throw new MyError(`${req.params.id} id тэй company олдсонгүй.`, 400);
  }

  await company.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: company,
  });
});