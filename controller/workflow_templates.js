
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");


exports.getworkflow_templates = asyncHandler(async (req, res, next) => {
  let where = ""
  if (req.query) {
    let key = Object.keys(req.query)
    let value = Object.values(req.query)
    key.map((k, i) => {
      (i === 0) ? where = where + `where ${k}=${value[i]} ` : where = where + ` and ${k}=${value[i]}`;
    })
  }

  let query = `select wt.id,w.id as workflowId,w.min,w.max,cur.code,cmp.name as companyName,wt.step,wt.is_last,r.description as roleDesc,o.name as orgName
  from workflow_templates wt
  left join workflows w on wt.workflowId =w.id
  left join roles r on wt.roleId=r.id
  left join organizations o on wt.organizationId=o.id
  left join currencies cur on w.currencyId=cur.id
  left join company cmp on w.companyId = cmp.id `

  if (where !== "") {
    where.substring(0, where.length - 4);
    console.log(where)
    query = query + where
  }

  const [uResult, uMeta] = await req.db.sequelize.query(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: uResult
  });
});



exports.createworkflow_template = asyncHandler(async (req, res, next) => {

  const newworkflow_template = await req.db.workflow_templates.create(req.body);
  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: newworkflow_template,
  });
});


exports.updateworkflow_template = asyncHandler(async (req, res, next) => {
  let user = await req.db.workflow_templates.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй workflow_template олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: user,
  });
});


exports.deleteworkflow_template = asyncHandler(async (req, res, next) => {
  let workflow_template = await req.db.workflow_templates.findByPk(req.params.id);

  if (!workflow_template) {
    throw new MyError(`${req.params.id} id тэй workflow_template олдсонгүй.`, 400);
  }

  await workflow_template.destroy();

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflow_template,
  });
});