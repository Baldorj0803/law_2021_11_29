const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const path = require("path");
const sequelize = require("sequelize");

exports.getitems = asyncHandler(async (req, res, next) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 100;
	const sort = req.query.sort;
	let select = req.query.select;

	if (select) {
		select = select.split(" ");
	}

	["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

	let query = {};
	if (req.query) {
		query.where = req.query;
	}

	const pagination = await paginate(page, limit, req.db.items, query);

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

	query.include = [{ model: req.db.req_status }];

	const items = await req.db.items.findAll(query);

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: items,
		pagination,
	});
});
exports.getItem = asyncHandler(async (req, res, next) => {
	let item = await req.db.items.findByPk(req.params.id);

	if (!item) {
		throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
	}

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: item,
	});
});

exports.createitem = asyncHandler(async (req, res, next) => {
	let message;
	if (!req.files) {
		throw new MyError("Гэрээгээ оруулна уу", 400);
	}
	const file = req.files.file;

	if (
		!file.mimetype.endsWith("application/octet-stream") &&
		!file.mimetype.endsWith("document") &&
		!file.mimetype.endsWith("msword") &&
		!file.mimetype.endsWith("pdf")
	) {
		throw new MyError("Та word эсвэл pdf file upload хийнэ үү", 400);
	}

	if (file.mimetype.endsWith("document") || file.mimetype.endsWith("msword")) {
		if (process.env.MAX_FILE_SIZE_WORD) {
			if (file.size > process.env.MAX_FILE_SIZE_WORD) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	if (file.mimetype.endsWith("pdf")) {
		if (process.env.MAX_FILE_SIZE_PDF) {
			if (file.size > process.env.MAX_FILE_SIZE_PDF) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	req.body.file = `file_${Date.now()}${path.parse(file.name).ext}`;
	file.name = req.body.file;

	//Тухайн өдрөөр фолдер үүсгэж хадгалах
	let time = new Date();
	time.setHours(time.getHours() + 8);
	let folderName = `${time.getFullYear()}-${time.getMonth()}-${time.getDay()}`;

	file.mv(`./public/${folderName}/${file.name}`, (err) => {
		if (err) {
			throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
		}
	});

	req.body.userId = req.userId;
	req.body.typeId = 1;
	req.body.rangeId = parseInt(req.body.rangeId);
	req.body.company = parseInt(req.body.company);
	const newitem = await req.db.items.create(req.body);
	message = "Файл амжилттай хадгалагдлаа. ";

	// //хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
	let new_request = {};
	if (!req.body.workflowId) {
		throw new MyError(message + `Дамжлагын дугаар дамжуулаагүй байна`, 400);
	}

	new_request.itemId = newitem.id;
	//Хүлээгдэж төлөвтэй үүсгэх
	new_request.reqStatusId = 2;
	//Эхний алхам байх бөгөөд аль дамжлагын үйлдэл дээр явж байгааг олох

	//өөрөөс нь багат lvl тэй алхам байвал алгасна
	let step = 2;
	let workflow_template = await req.db.workflow_templates.findOne({
		where: {
			workflowId: newitem.workflowId,
			step,
		},
	});

	// дараагийн үйлдэл нь миний роль оос бага албан тушаалтай хүн хийх бол алгасна
	if (
		workflow_template.roleId >= req.roleId &&
		(workflow_template.organizationId === null ||
			workflow_template.organizationId !== req.orgId)
	) {
		for (let index = req.roleId; index > workflow_template.roleId; ) {
			if (workflow_template.is_last === 1) {
				//err бүх үйлдлийг алгаслаа
				console.log("Бүх үйлдлийг алгаслаа");
				break;
			}
			step++;
			workflow_template = await req.db.workflow_templates.findOne({
				where: {
					workflowId: newitem.workflowId,
					step,
				},
			});
		}
	}

	if (!workflow_template) {
		throw new MyError(
			message + `Workflow template ээс эхний алхамд торирох үйлдэл олдсонгүй`,
			400
		);
	}
	new_request.workflowTemplateId = workflow_template.id;

	if (!workflow_template.organizationId) {
		console.log(workflow_template.roleId + " роль хүртэл давтах");
		console.log(req.roleId + " миний роль");
		let parentId,
			levelId = req.roleId;
		for (let index = req.roleId; index < array.length; index++) {
			if (workflow_template.roleId === levelId) {
				break;
			}
		}
	} else {
		//Нэг org байна /Тэр газрын захирал/
		let recieveUser = await req.db.users.findAll({
			where: {
				organizationId: workflow_template.organizationId,
			},
		});
		if (recieveUser.length === 0) {
			throw new MyError(
				message + `Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`,
				400
			);
		}
		new_request.recieveUser = recieveUser[0].id;
	}

	// new_request = await req.db.request.create(new_request);

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: {
			newitem,
			new_request,
		},

		// workflow,
	});
});

exports.sendReq = asyncHandler(async (req, res, next) => {
	let user = await req.db.items.findByPk(req.params.id);

	if (!user) {
		throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
	}

	user = await user.update(req.body);

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: user,
	});
});

exports.updateitem = asyncHandler(async (req, res, next) => {
	let user = await req.db.items.findByPk(req.params.id);

	if (!user) {
		throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
	}

	user = await user.update(req.body);

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: user,
	});
});

exports.deleteitem = asyncHandler(async (req, res, next) => {
	let item = await req.db.items.findByPk(req.params.id);

	if (!item) {
		throw new MyError(`${req.params.id} id тэй item олдсонгүй.`, 400);
	}

	await item.destroy();

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: item,
	});
});
