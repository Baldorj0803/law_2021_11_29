const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandle");
const MyError = require("../utils/myError");

exports.protect = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization) {
    throw new MyError(
      "Та эхлээд логин хийнэ үү. Authorization header-ээр токеноо дамжуулна уу.",
      401
    );
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    throw new MyError("Токен байхгүй байна.", 400);
  }
  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);

  req.userId = tokenObj.id;
  req.roleId = tokenObj.roleId;

  next();
});

exports.authorize = asyncHandler(async (req, res, next) => {
  // if (!req.userId || !req.roleId) {
  //   throw new MyError(
  //     "Та эхлээд логин хийнэ үү",
  //     401
  //   );
  // }
  // let url = req.originalUrl.replace(req.baseUrl, '')

  // let whereSql, q;
  // if (req.method === 'GET' && url.substring(0, 1) !== '/') {
  //   whereSql = 'isView'
  // } else {
  //   if (url.substring(0, 1) === '/') {
  //     url = url.substring(1, url.length);
  //     url = url.substring(0, url.indexOf('/'));
  //     switch (url) {
  //       case 'update':
  //         whereSql = 'isEdit'
  //         break;
  //       case 'create':
  //         whereSql = 'isAdd'
  //         break;
  //       case 'delete':
  //         whereSql = 'isDelete'
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }

  // if (whereSql !== null) {
  //   q = "select * from role_has_permissions rp  left join permissions p on  rp.permission_id = p.id where rp.role_id=" + req.roleId + " and p." + whereSql + "='1'"

  //   const [uResult, uMeta] = await req.db.sequelize.query(q);

  //   if (uResult.length === 0) {
  //     throw new MyError(
  //       "Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна.",
  //       401
  //     );
  //   }
  // }


  next()
});
