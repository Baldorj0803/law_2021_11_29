
const asyncHandler = require('../middleware/asyncHandle');
const MyError = require("../utils/myError")

exports.getWorkflowTemplate = asyncHandler(async (req, item, step) => {
    let lastTemplate = await req.db.workflow_templates.findOne({
        where: {
            workflowId: item.workflowId,
            is_last: 1
        }
    })
    let workflow_template;
    //Хэрвээ сүүлийн алхам биш бол дараагийн алхамыг олно
    if (lastTemplate.step > step) {
        for (let index = step; index <= lastTemplate.step; index++) {
            let checkWorkflowTemplate = await req.db.workflow_templates.findOne({
                where: {
                    workflowId: item.workflowId,
                    step: index,
                },
            });
            //Хэрвээ дараагийн шатны хэрэглэгч надаас өндөр албан тушаалтай бол шууд
            if (checkWorkflowTemplate.roleId < req.roleId) {
                workflow_template = checkWorkflowTemplate;
                break;
            } else {
                //Надаас бага эсвэл тэнцүү албан тушаалтай хүн бол , заавал шалгуулах эсэхийг тодорхойлох

                // тэнцүү албан тушаал ч гэсэн ерөнхий /захирлууд/ биш байвал шалгах 
                if (checkWorkflowTemplate.roleId === req.roleId && checkWorkflowTemplate.organizationId !== null) {
                    //Тэнцүү албан тушаалтай ч миний дээд удирдлага бол
                    //Жнь Тэргүүн дэд захирал:Компани -->Дэд захирал компани
                    let myOrganization = await req.db.organizations.findByPk(req.orgId);
                    let templateOrg = await req.db.organizations.findByPk(checkWorkflowTemplate.organizationId);
                    if (myOrganization.parentId === templateOrg.id) {
                        workflow_template = checkWorkflowTemplate;
                    }
                }

                //Надаас бага албан тушаалтай ч заавал шалгуулахаар заагдсан
                if (checkWorkflowTemplate > req.roleId && checkWorkflowTemplate.organizationId !== null) {
                    workflow_template = checkWorkflowTemplate
                }
            }
        }
    }

    if (!workflow_template) {
        throw new MyError(`Дараагийн шатанд хийх үйлдсэл олдсонгүй`,
            400
        );
    }
    console.log(`Дараагийн шат-${workflow_template.id}`.green)
    return workflow_template
})




exports.recieveUser = asyncHandler(async (req, workflow_template) => {
    let userId;
    // ---------------Дараагийн шатаа олсон бол тухайн шатны роль орг оос хамаарч тухайн хүнийг олох
    if (workflow_template && workflow_template.organizationId && workflow_template.organizationId !== null) {
        console.log(workflow_template.roleId + " роль хүртэл давтах");
        console.log(req.roleId + " миний роль");
        let currentOrg = req.orgId;
        for (let index = req.roleId; index >= workflow_template.roleId; index--) {
            let myOrganization = await req.db.organizations.findByPk(currentOrg);
            let parent = await req.db.organizations.findByPk(myOrganization.parent_id);
            
            if (parent.level_id === workflow_template.roleId) {
                let recieveUser = await req.db.users.findAll({
                    where: {
                        organizationId: workflow_template.organizationId,
                    },
                });
                userId = recieveUser[0].id;
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
        userId = recieveUser[0].id;
    }

    console.log(`Хүлээн авах хэрэглэгч: ${userId}`.green);
    return userId;
})
