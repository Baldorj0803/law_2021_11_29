const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { Op } = require("sequelize");
const email = require('../utils/email')
const crypto = require('crypto')

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query = {};
  if (req.query) {
    let key = Object.keys(req.query);
    let value = Object.values(req.query);
    query.where = {};
    key.map((k, i) => {
      query.where[k] = {};
      query.where[k][Op.like] = `%${value[i]}%`;
    });
  }

  const pagination = await paginate(page, limit, req.db.users, query);

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
  //password талбарыг дамжуулахгүй
  query["attributes"] = { exclude: ["password"] };
  query["include"] = { model: req.db.organizations };

  const users = await req.db.users.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: users,
    pagination,
  });
});

//register
exports.createUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findOne({ where: { email: req.body.mobile } });

  if (user) {
    throw new Error("Утасны дугаар бүртгэгдсэн байна", 400);
  }

  user = await req.db.users.findOne({ where: { email: req.body.email } });

  if (user) {
    throw new Error("Имэйл бүртгэгдсэн байна", 400);
  }

  const newUser = await req.db.users.create(req.body);
  newUser.password = null;
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newUser,
  });
});

//login
exports.login = asyncHandler(async (req, res, next) => {
  //email password орж ирсэн эсэхийг шалгах
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    throw new Error("Утасны дугаар нууц үгээ дамжуулна уу", 400);
  }

  //Имэйл  хайх
  let user = await req.db.users.findOne({
    where: { mobile: req.body.mobile },
    include: [{ model: req.db.roles }, { model: req.db.organizations }],
  });

  if (!user) {
    throw new Error("Утасны дугаар нууц үг буруу байна", 401);
  }

  //нууц үг шалгах
  // const ok = await user.checkPassword(password);
  const ok = true;

  if (!ok) {
    throw new Error("Утасны дугаар нууц үг буруу байнаa", 401);
  }

  /* !!! token авсны дараа role ийг null болгох  */
  let token = user.getJsonWebToken();
  if (user.password) user.password = null;
  if (user.role_id) user.role_id = null;

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
    token,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {

  if (!req.body.email) throw new Error('Та нууц үг сэргээх имэйл хаягаа дамжуулна уу', 400);

  const user = await req.db.users.findOne({ where: { email: req.body.email } });

  if (!user) throw new Error(`${req.body.email}  имэйлтэй хэрэглэгч олдсонгүй!`, 400);

  const resetToken = user.generatePasswordChangeToken();

  await user.save()
  //Имэйл илгээнэ

  const message = `Сайн байна уу<br><br>Та нууц үгээ солих хүсэлт илгээлээ. <br> Нууц үгээ доорх линк дээр дарж солино уу<br><br><a href="${process.env.DOMAIN}/#/changePassword/${resetToken}">${process.env.DOMAIN}</a><br><br>Өдрийг сайхан өнгөрүүлээрэй`

  let info = await email({
    subject: 'Хуулийн гэрээний систем, Нууц үг солих тухай',
    to: user.email,
    message,
    type: 'changePassword'
  })

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    resetToken,
    info
  });
});
exports.resetPassword = asyncHandler(async (req, res, next) => {

  if (!req.body.resetToken || !req.body.password) throw new Error('Таны хүсэлт амжилтгүй боллоо', 400);

  const encrypted = crypto.createHash('sha256').update(req.body.resetToken).digest('hex');

  const user = await req.db.users.findOne({
    where: {
      resetPasswordToken: encrypted,
      resetPasswordExpire: { [Op.gt]: Date.now() }
    }
  });


  if (!user) throw new Error('Токен хүчингүй байна', 400);

  user.password = await user.generatePassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  user.save()

  const token = user.getJsonWebToken()

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    token,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  if (req.body.password) {
    req.body.password = await user.generatePassword(req.body.password);
  }
  user = await user.update(req.body);
  user.password = null;

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.userId);

  const ok = await user.checkPassword(req.body.password);

  if (!ok) {
    throw new Error("Хуучин нууц үг буруу байна", 401);
  }

  if (req.body.newPassword) {
    req.body.password = await user.generatePassword(req.body.newPassword);
  }

  user = await user.update({ password: req.body.password });
  user.password = null;

  user.password = null;
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  await user.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});
exports.updateIp = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.userId);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  const parseIp = (req) =>
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress;

  await user.update({ last_login_ip: parseIp(req) });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
  });
});
