
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getMenus = asyncHandler(async (req, res, next) => {
  let myMenu = [];

  const menus = await req.db.menus.findAll({
    include: [
      {
        model: req.db.permissions,
        attributes: ['roles', 'organizations']
      }
    ],
    attributes: { exclude: ['orderNo'] }
  });

  myMenu = menus.filter((item) => {
    if (item.type === 1) item._children = item.name;
    item = item.permission;
    if (req.roleId && req.orgId) {
      if (item.roles !== null) {
        let val = item.roles.filter(i => i === (req.roleId) ? req.roleId : "");
        if (val.length === 0) { //миний роль байхгүй бол орг оос хайх
          if (item.organizations&&item.organizations !== null) {
            let val = item.organizations.filter(i => (i === req.orgId) ? req.orgId : "");
            if (val.length > 0) return true;
            return false;
          } else return false;
        } else return true
      } else return true
    } else return false;
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: myMenu
  });
});


exports.createMenu = asyncHandler(async (req, res, next) => {

  const newMenu = await req.db.menus.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newMenu,
  });
});


exports.updateMenu = asyncHandler(async (req, res, next) => {
  let menu = await req.db.menus.findByPk(req.params.id);

  if (!menu) {
    throw new MyError(`${req.params.id} id тэй Menu олдсонгүй.`, 400);
  }

  menu = await menu.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: menu,
  });
});


exports.deleteMenu = asyncHandler(async (req, res, next) => {
  let menu = await req.db.menus.findByPk(req.params.id);

  if (!menu) {
    throw new MyError(`${req.params.id} id тэй Menu олдсонгүй.`, 400);
  }

  await menu.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: menu,
  });
});