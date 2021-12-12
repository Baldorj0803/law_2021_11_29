
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getworkflows = asyncHandler(async (req, res, next) => {
  const workflows = await req.db.workflows.findAll();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflows,
  });
});



exports.createworkflow = asyncHandler(async (req, res, next) => {

  const newworkflow = await req.db.workflows.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newworkflow,
  });
});


exports.updateworkflow = asyncHandler(async (req, res, next) => {
  let user = await req.db.workflows.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй workflow олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteworkflow = asyncHandler(async (req, res, next) => {
  let workflow = await req.db.workflows.findByPk(req.params.id);

  if (!workflow) {
    throw new MyError(`${req.params.id} id тэй workflow олдсонгүй.`, 400);
  }

  await workflow.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflow,
  });
});