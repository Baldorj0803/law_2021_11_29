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
	req.orgId = tokenObj.orgId;

	next();
});


exports.authorize = asyncHandler(async (req, res, next) => {
	if (!req.userId) {
		this.protect(req, res, next);
	}

	let structedUrl = req.baseUrl.replace(process.env.BASE_URL, '') 
	// console.log(structedUrl);
	if(req.route.path!=="/") structedUrl=structedUrl+req.route.path;


	// console.log(structedUrl);

	let permissions = await req.db.permissions.findOne({
		where: {
			route: structedUrl,
			method:req.method
		}
	})
	// console.log(permissions.organizations);
	// console.log(permissions.roles);
	let ok = false;
	let find;

	if(!permissions)throw new MyError("Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна", 400); 
	if (permissions.organizations === null) {
		ok = checkRole(req.roleId, permissions.roles)
	} else if (permissions.organizations.length > 0) {
		find = permissions.organizations.filter(el => el === req.orgId);
		if (find.length > 0) {
			ok = true;
		} else {
			ok = checkRole(req.roleId, permissions.roles)
		}
	}

	if(!ok) throw new MyError("Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна", 400);
	next();
});


function checkRole(myRole, roles) {
	if (roles !== null) {
		if (roles.length === 0) return false;
		let filteredRole = roles.filter(r => r === myRole);
		if (filteredRole.length === 0) return false;
	}

	return true;

}