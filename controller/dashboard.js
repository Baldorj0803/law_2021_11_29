
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const variable = require('../config/const')


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

    let query = `select o.name,count(u.organizationId) as total
    from (select * from request where reqStatusId=${variable.PENDING} and modifiedBy is null) as r
    left join recieveusers ru on r.id = ru.requestId
    left join users u on ru.userId = u.id
    left join organizations o on u.organizationId = o.id
    group by o.id
    order by o.id asc;`;
    const [uResult, uMeta] = await req.db.sequelize.query(query);


    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: uResult
    });
});



exports.getItemDetail = asyncHandler(async (req, res, next) => {


    // let query = `select i.id, i.createdAt,u.name as userName,u.profession,o.name as orgName,i.name as itemName,
    // rs.slug,rs.name as statusName
    // from items i
    // left join users u on i.userId=u.id
    // left join organizations o on u.organizationId=o.id
    // left join req_status rs on i.reqStatusId=rs.id
    // where rs.id not in (${variable.CANCELED},${variable.DRAFT})
    // order by i.updatedAt desc
    // limit 10`

    // let query = `select i.id, i.createdAt,u.name as userName,u.profession,o.name as orgName,i.name as itemName,
    // rs.slug,rs.name as statusName,r.*
    // from items i
    // left join (
    // 	select r.itemId,u.profession,u.lastname as rlastname,u.name as ruserName,o.name as rorgName from request  r 
    // left join recieveUsers ru on r.id=ru.requestId
    // left join users u on u.id=ru.userId
    // left join organizations o on u.organizationId=o.id
    // where r.reqStatusId=${variable.PENDING}
    // ) as r on r.itemId=i.id
    // left join users u on i.userId=u.id
    // left join organizations o on u.organizationId=o.id
    // left join req_status rs on i.reqStatusId=rs.id
    // where rs.id not in (${variable.CANCELED},${variable.DRAFT}) 
    // order by i.updatedAt desc
    // limit 10;`

    let query = `select i.id, i.createdAt,i.name as itemName,
    rs.slug,rs.name as statusName,r.*
    from items i
    left join (
		select  r.itemId,u.profession,u.lastname as rlastname,u.name as ruserName,
        o.name as rorgName ,wt.name as wName,count(*) as totalOrg
        from request  r 
        left join workflow_templates wt on r.workflowTemplateId=wt.id
		left join recieveUsers ru on r.id=ru.requestId
		left join users u on u.id=ru.userId
		left join organizations o on u.organizationId=o.id
		where r.reqStatusId=${variable.PENDING}
		group by r.itemId
    ) as r on r.itemId=i.id
    left join req_status rs on i.reqStatusId=rs.id
    where rs.id not in (${variable.CANCELED},${variable.DRAFT})  
    order by i.updatedAt desc
    limit 10;`

    const [uResult, uMeta] = await req.db.sequelize.query(query);


    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: uResult
    });
});
