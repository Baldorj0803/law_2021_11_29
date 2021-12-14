
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { Op } = require("sequelize");


exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
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
    query.where = {}
    key.map((k, i) => {
      query.where[k] = {}
      query.where[k][Op.like] = `%${value[i]}%`
    })
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
  query["attributes"] = { exclude: ['password'] }

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

  const user = await req.db.users.findOne({ where: { email: req.body.email } })

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
  let u = await req.db.users.findByPk(30)
  console.log(u);

  console.log(req.body);
  let user = await req.db.users.findOne({ where: { mobile: req.body.mobile }, include: [{ model: req.db.roles }, { model: req.db.organizations }] })
  console.log(user);
  if (!user) {
    throw new Error("Утасны дугаар нууц үг буруу байна", 401);
  }

  //нууц үг шалгах
  // const ok = await user.checkPassword(password);
  const ok = (password === user.password) ? true : false;

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
    token
  });
});


exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.users.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

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