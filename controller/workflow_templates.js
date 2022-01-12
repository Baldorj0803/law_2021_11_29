
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");


exports.getworkflow_templates = asyncHandler(async (req, res, next) => {

  let workflow_templates = await req.db.workflow_templates.findAll({
    attributes: { exclude: ['roleId'] },
    where: req.query,
    include: [
      {
        model: req.db.workflows,
        include: [
          { model: req.db.currencies },
          { model: req.db.company },
          { model: req.db.workflowType }
        ]
      }, {
        model: req.db.roles
      },
      {
        model: req.db.workflowOrganizations,
        include: {
          model: req.db.organizations
        }
      }
    ]
  });

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: workflow_templates
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