const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.getregistrations = asyncHandler(async (req, res, next) => {
  const registrations = await req.db.registrations.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: registrations,
  });
});

exports.createregistration = asyncHandler(async (req, res, next) => {
  const newregistration = await req.db.registrations.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newregistration,
  });
});

exports.updateregistration = asyncHandler(async (req, res, next) => {
  let user = await req.db.registrations.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй бүртгэл олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});

exports.deleteregistration = asyncHandler(async (req, res, next) => {
  let registration = await req.db.registrations.findByPk(req.params.id);

  if (!registration) {
    throw new MyError(`${req.params.id} id тэй бүртгэл олдсонгүй.`, 400);
  }

  await registration.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: registration,
  });
});
