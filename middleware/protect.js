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

  // console.log(tokenObj);

  req.userId = tokenObj.id;
  req.roleId = tokenObj.roleId;

  next();
});

exports.authorize = asyncHandler(async (req, res, next) => {
  let endPoint = req.originalUrl.replace(req.params[Object.keys(req.params)[0]],'')
  q = "select * from role_has_permissions rp  left join permissions p on  rp.permission_id = p.id where rp.role_id=" + req.roleId+" and p.url='"+endPoint+"'"

  const [uResult, uMeta] = await req.db.sequelize.query(q);

  if(uResult.length===0){
    throw new MyError(
      "Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна.",
      401
    );
  }


  next()
});
