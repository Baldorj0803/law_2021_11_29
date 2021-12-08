
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getranges = asyncHandler(async (req, res, next) => {
  
  const ranges = await req.db.ranges.findAll({include  : [{ model: req.db.currencies}]});


  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: ranges,
  });
});



exports.createrange = asyncHandler(async (req, res, next) => {

  const newrange = await req.db.ranges.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newrange,
  });
});


exports.updaterange = asyncHandler(async (req, res, next) => {
  let user = await req.db.ranges.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй range олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleterange = asyncHandler(async (req, res, next) => {
  let range = await req.db.ranges.findByPk(req.params.id);

  if (!range) {
    throw new MyError(`${req.params.id} id тэй range олдсонгүй.`, 400);
  }

  await range.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: range,
  });
});