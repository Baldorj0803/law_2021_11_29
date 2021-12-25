const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const MyError = require("../utils/myError");
const { recieveUser, getWorkflowTemplate } = require("../utils/recieveUser");
const { saveFIle } = require("../utils/saveFile");
const variable = require('../config/const')
const fs = require('fs');
const { request } = require("express");

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
exports.getConfirmedItems = asyncHandler(async (req, res, next) => {


	let query = `SELECT i.id,i.name,i.file,i.trmCont,i.warrantyPeriod,i.reqStatusId,i.createdAt,c.name as companyName, u.name as userName,
	o.name as orgName,wt.name as workflowTypeName,wt.id as workflowTypeId,c.id as companyId
	FROM items i 
	left join workflows w on i.workflowId=w.id
	left join workflowtype wt on w.workflowTypeId=wt.id
	left join company c on w.companyId=c.id
	left join users u on i.userId=u.id
	left join organizations o on u.organizationId=o.id
	where i.reqStatusId=5`;
    const [uResult, uMeta] = await req.db.sequelize.query(query);

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: uResult,
	});
});
exports.myItems = asyncHandler(async (req, res, next) => {
	let query = {}
	query.include = [
		{ model: req.db.req_status },
		{
			model: req.db.request,
			order: [
				['createdAt', 'DESC']
			]
			// include:[
			// 	{
			// 		model:req.db.req_status
			// 	}
			// ]
		}];
	query.where = { userId: req.userId };
	const items = await req.db.items.findAll({
		where: { userId: req.userId },
		include: [
			{ model: req.db.req_status },
			{
				model: req.db.request,
				include: [
					{
						model: req.db.req_status
					},{
						model:req.db.workflow_templates
					}
				]
			}],
		order: [['createdAt', 'DESC']]
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

	req.body.file = await saveFIle(req.files.file, req.body.file, "files");

	req.body.userId = req.userId;
	req.body.typeId = variable.DRAFT;
	req.body.workflowId = parseInt(req.body.workflowId);
	req.body.company = parseInt(req.body.company);
	req.body.reqStatusId = variable.DRAFT;
	const newitem = await req.db.items.create(req.body);
	msg = "Файл амжилттай хадгалагдлаа. ";

	//хэрвээ гэрээ үүсвэл шинээр хүсэлт бичигдэнэ
	let new_request = {};
	let useTemplateId = await getWorkflowTemplate(req, newitem, 1)
	if (useTemplateId === 0) {
		newitem.typeId = variable.PENDING;
		await newitem.save()
		res.status(200).json({
			code: res.statusCode,
			message: "Дараагийн алхам байхгүй" + message,
			data: {
				newitem,
			},
		});
	}
	new_request.workflowTemplateId = useTemplateId;
	new_request.itemId = newitem.id,
		new_request.reqStatusId = variable.PENDING;
	let useTemplate = await req.db.workflow_templates.findByPk(useTemplateId)
	if (new_request.workflowTemplateId) new_request.recieveUser = await recieveUser(req, useTemplate, newitem)
	new_request = await req.db.request.create(new_request);
	msg = msg + "Хүсэлт дараагийн шатанд амжилттай илгээгдлээ"
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
//Цуцлагдсан хүсэлтийг дахин илгээхэд ашиглагдана
exports.updateitem = asyncHandler(async (req, res, next) => {
	let msg = "";

	if (!req.files) {
		throw new MyError("Гэрээгээ оруулна уу", 400);
	}

	let item = await req.db.items.findOne({
		where: {
			id: req.params.itemId,
			userId: req.userId,
		}
	});
	let request = await req.db.request.findOne({
		where: {
			id: req.params.requestId,
			reqStatusId: variable.CANCELED
		}
	});

	if (!item) throw new MyError(`${req.params.itemId} id тэй item олдсонгүй.`, 400)

	if (!request) throw new MyError(`${req.params.requestId} id тэй request олдсонгүй.`, 400)

	req.body.file = await saveFIle(req.files.file, req.body.file, "files");
	req.body.reqStatusId = variable.PENDING;
	console.log("Шинэ файл:", req.body.file);
	let removeItemFile = item.file;

	updatedItem = await item.update(req.body);

	if (removeItemFile && removeItemFile != "") {
		console.log("Өмнөх файл:", removeItemFile);
		fs.unlink(`./public/files/${removeItemFile}`, (err) => {
			if (err) {
				console.error(err)
				return
			}
			msg = ", Цуцалсан хүсэлтийн файлыг устгалаа"
		})
	} else msg = "Устгах файл байхгүй байна"

	//Шинээр дараагийн хүсэлт бэлдэх
	// id, modifiedBy, workflowTemplateId, itemId, reqStatusId, 
	// recieveUser, suggestion, uploadFileName, createdAt, updatedAt
	let removeFileName = request.uploadFileName;

	let requestBody = {
		modifiedBy: null,
		reqStatusId: variable.PENDING,
		suggestion: null,
		uploadFileName: null
	}
	updatedReq = await request.update(requestBody);



	if (removeFileName && removeFileName != "") {
		fs.unlink(`./public/files/${removeFileName}`, (err) => {
			if (err) {
				console.error(err)
				return
			}
			msg = ", Цуцалсан хүсэлтийн файлыг устгалаа"
		})
	} else msg = "Устгах файл байхгүй байна"

	res.status(200).json({
		code: res.statusCode,
		message: "success" + msg,
		data: {
			updatedItem,
			updatedReq
		},
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
		message: "success" + msg,
		data: item,
	});
});


exports.downloadMyItemFile = asyncHandler(async (req, res, next) => {

	if (!req.params.itemId || !req.params.fileName) {
		throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
	}

	let item = await req.db.items.findOne({
		where: {
			id: req.params.itemId,
			userId: req.userId,
			file: req.params.fileName
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



exports.downloadItemFile = asyncHandler(async (req, res, next) => {

	if (!req.params.itemId || !req.params.fileName) {
		throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
	}

	let check = await req.db.request.findOne({
		where: {
			recieveUser: req.userId,
			itemId: req.params.itemId
		}
	})
	if (!check) throw new MyError("Та энэ гэрээн дээр хүсэлт аваагүй тул татах боломжгүй байна")
	let item = await req.db.items.findOne({
		where: {
			id: req.params.itemId,
			file: req.params.fileName
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


exports.getItemByRequest = asyncHandler(async (req, res, next) => {

	let request = await req.db.request.findByPk(req.params.requestId);

	if (!request) {
		throw new MyError(`${req.params.requestId} id тэй хүсэлт олдсонгүй.`, 400);
	}

	let item = await req.db.items.findOne({
		where: {
			id: request.itemId,
			userId: req.userId
		}
	});

	if (!item) {
		throw new MyError(`${request.itemId} id тэй гэрээ олдсонгүй.`, 400);
	}

	res.status(200).json({
		code: res.statusCode,
		message: "success",
		data: item,
	});
});