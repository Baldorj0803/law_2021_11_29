const asyncHandler = require("express-async-handler");
const path = require("path");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const variable = require('../config/const')
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

exports.myItems = asyncHandler(async (req, res, next) => {
	let query={}
	query.include = [
		{ model: req.db.req_status },
		{
			model:req.db.request,
			// include:[
			// 	{
			// 		model:req.db.req_status
			// 	}
			// ]
		}];
	query.where ={userId:req.userId};
	const items = await req.db.items.findAll({
		where:{userId:req.userId},
		include :[
			{ model: req.db.req_status },
			{
				model:req.db.request,
				include:[
					{
						model:req.db.req_status
					}
				]
			}]
	});

	

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: items,
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
	let msg;
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

	file.mv(`./public/files/${file.name}`, (err) => {
		if (err) {
			throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
		}
	});

	req.body.userId = req.userId;
	req.body.typeId = variable.DRAFT;
	req.body.workflowId = parseInt(req.body.workflowId);
	req.body.company = parseInt(req.body.company);
	req.body.reqStatusId=variable.DRAFT;
	const newitem = await req.db.items.create(req.body);
	msg = "Файл амжилттай хадгалагдлаа. ";

	//хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
	let new_request = {};
	let useTemplate = await getWorkflowTemplate(req, newitem, 1)
	if (useTemplate === 0) {
		newitem.typeId = variable.PENDING;
		await newitem.save()
		res.status(200).json({
			code: res.statusCode,
			message: "Дараагийн алхам байхгүй"+message,
			data: {
				newitem,
			},
		});
	}
	new_request.workflowTemplateId = useTemplate.id;
	new_request.itemId = newitem.id,
		new_request.reqStatusId = variable.PENDING;
	if (new_request.workflowTemplateId) new_request.recieveUser = await recieveUser(req, useTemplate,newitem)
	new_request = await req.db.request.create(new_request);
	msg=msg+"Хүсэлт дараагийн шатанд амжилттай илгээгдлээ"
	newitem.reqStatusId = variable.PENDING;
	await newitem.save()

	res.status(200).json({
		code: res.statusCode,
		message: `${msg}`,
		data: {
			newitem,
			new_request,
		},
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


exports.downloadItemFile = asyncHandler(async (req, res, next) => {

	if (!req.params.itemId || !req.params.fileName) {
	  throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
	}
  
	let item = await req.db.items.findOne({
	  where: {
		id: req.params.itemId,
		userId: req.userId,
		file:req.params.fileName
	  }
	})
	if (!item) {
	  throw new MyError(`${req.params.fileName} файлыг татах боломжгүй байна`, 400)
	}

	res.download(process.env.FILE_PATH + `/files/${req.params.fileName}`, function (err) {
	  if (err) {
		console.log(err);
		res.status(404).end()
	  }
	});
  });