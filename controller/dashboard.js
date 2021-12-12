
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const item_types = require("../models/item_types");


exports.totalStat = asyncHandler(async (req, res, next) => {

    let query = `SELECT r.*, COUNT(*) as total
    FROM items  i
    left join req_status r on i.reqStatusId=r.id
    GROUP BY reqStatusId`

    const [uResult, uMeta] = await req.db.sequelize.query(query);

    const totalUser = await req.db.users.count();

    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: {
            total: { ...uResult },
            totalUser
        },
    });
});


exports.getRequestProcess = asyncHandler(async (req, res, next) => {

    if (!req.params.workflowId) {
        throw new MyError("Дамжлагын дугаар дамжуулаагүй байна");
    }

    let w = await req.db.workflows.findByPk(req.params.workflowId)
    if (!w) throw new MyError(`${req.params.workflowId} дугаартай дамжлага олдсонгүй`)

    let query = `select wt.workflowId, step,reqStatusId,count(*) as total,wt.name
    from request r
    left join workflow_templates wt on r.workflowTemplateId=wt.id
    where wt.workflowId=${req.params.workflowId}
    group by wt.step`

    const [uResult, uMeta] = await req.db.sequelize.query(query);


    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: uResult
    });
});



exports.getItemDetail = asyncHandler(async (req, res, next) => {


    let query = `select i.id, i.createdAt,u.name as userName,u.profession,o.name as orgName,i.name as itemName,
    rs.slug,rs.name as statusName
    from items i
    left join users u on i.userId=u.id
    left join organizations o on u.organizationId=o.id
    left join req_status rs on i.reqStatusId=rs.id`

    const [uResult, uMeta] = await req.db.sequelize.query(query);


    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: uResult
    });
});
