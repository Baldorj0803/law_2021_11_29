
const asyncHandler = require('../middleware/asyncHandle');
const MyError = require("../utils/myError")


exports.getWorkflowTemplate = asyncHandler(async (req, item, step) => {

    //!!! important
    //Дараагийн шат надаас өндөр рольтой байвал бол дамжих 
    //Дараагийн шат надтай ижил рольтой бөгөөд орг байхгүй бол алгасах
    //Дараагийн шат надтай ижил рольтой бөгөөд орг байх бөгөөд компани роль биш байвал дамжих
    //Дараагийн шат надтай ижил рольтой бөгөөд орг байх бөгөөд компани рольтой миний дээд хүн байвал дамжих
    //Дараагийн шат надаас бага рольтой бөгөөд орг байхгүй бол алгасах
    //Дараагийн шат надаас бага рольтой бөгөөд орг байвал дамжих

    const itemCreatedUser = await req.db.users.findByPk(item.userId);

    if (!itemCreatedUser) throw new MyError(`Энэхүү файлыг үүсгэсэн хэрэглсэг байхгүй байна`)


    let workflow_template;

    //Тухайн итемд хамаарах workflow ийн сүүлийн алхамыг олох
    // let range = await req.db.ranges.findByPk(item.rangeId);
    let lastTemplate = await req.db.workflow_templates.findOne({
        where: {
            workflowId: item.workflowId,
            is_last: 1
        }
    })
    if (!lastTemplate) throw new MyError(`${item.workflowId} id тай дамжлага дээр сүүлийн дамжлага тохируулаагүй байна`)

    if (lastTemplate.step > step) {
        for (let index = step; index <= lastTemplate.step; index++) {
            //Дараагийн алхамд шалгагдад workflow ийн template
            let checkWorkflowTemplate = await req.db.workflow_templates.findOne({
                where: {
                    workflowId: item.workflowId,
                    step: index,
                },
            });

            if (checkWorkflowTemplate.roleId < itemCreatedUser.roleId) {
                //Дараагийн шат надаас өндөр рольтой байвал бол дамжих
                workflow_template = checkWorkflowTemplate
                break;
            } else if (checkWorkflowTemplate > itemCreatedUser.roleId) {
                //Дараагийн шат надаас бага рольтой бөгөөд орг байхгүй бол алгасах
                //Дараагийн шат надаас бага рольтой бөгөөд орг байвал дамжих
                if (checkWorkflowTemplate.organizationId !== null) {
                    workflow_template = checkWorkflowTemplate
                    break;
                }
            } else if (checkWorkflowTemplate === itemCreatedUser.roleId) {
                //Дараагийн шат надтай ижил рольтой бөгөөд орг байхгүй бол алгасах
                //Дараагийн шат надтай ижил рольтой бөгөөд орг байх бөгөөд компани роль биш байвал дамжих
                //Дараагийн шат надтай ижил рольтой бөгөөд орг байх бөгөөд компани рольтой миний дээд хүн байвал дамжих
                if (itemCreatedUser.roleId === 1) {
                    let myOrganization = await req.db.organizations.findByPk(req.orgId);
                    let templateOrg = await req.db.organizations.findByPk(checkWorkflowTemplate.organizationId);
                    if (myOrganization.parentId === templateOrg.id) {
                        workflow_template = checkWorkflowTemplate;
                    }
                } else {
                    workflow_template = checkWorkflowTemplate;
                }
            }
        }
    } else if (lastTemplate.step === step) {
        //Энэ нөхцөл тэнцүү үед сүүлийн алхам байх бөгөөд дараагийн алхамыг тооцоолох шаардлагагүй
        return 0;
    }
    if (!workflow_template) {
        throw new MyError(`Дараагийн шатны дамжлага олдсонгүй`,
            400
        );
    }
    console.log(`Дараагийн шат-${workflow_template.id} ${workflow_template.name}`.green)
    return workflow_template

})

exports.recieveUser = asyncHandler(async (req, workflow_template,item) => {
    const itemCreatedUser = await req.db.users.findByPk(item.userId);

    if (!itemCreatedUser) throw new MyError(`Энэхүү файлыг үүсгэсэн хэрэглсэг байхгүй байна`)

    // !!! read me
    // өндөр роль 0 , бага 10... гэж тооцоологдоно
    
    //Надаас бага рольтой бөгөөд орг байвал 1 хүн
    //Надаас бага рольтой бөгөөд орг байхгүй бол алгасах
    
    //Надтай ижил рольтой бөгөөд орг байх бөгөөд компани роль биш 1 хүн
    //Надтай ижил рольтой бөгөөд орг байх бөгөөд компани рольтой миний дээд хүн байвал 1 хүн
    //Надтай ижил рольтой бөгөөд орг байхгүй бол алгасах
    
    //Надаас өндөр рольтой бөгөөд орг байвал 1 хүн
    //Надаас өндөр рольтой бөгөөд орг байхгүй бол олон хүн
    
    let userId;
    // ---------------Орг байвал 1 хүн байна
    // ---------------Орг байхгүй бол олон хүн байна
    if (workflow_template && workflow_template.organizationId && workflow_template.organizationId !== null) {
        //Нэг org байна /Тэр газрын захирал/
        let recieveUser = await req.db.users.findAll({
            where: {
                organizationId: workflow_template.organizationId,
            },
        });

        if (recieveUser.length === 0) {
            throw new MyError(
                 `Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`,
                400
            );
        }
        if (recieveUser.length [1]) {
            throw new MyError(
                 `${workflow_template.organizationId} алба нэгж дээр 1 ээс олон хүн бүртгэгдсэн тул хүлээн авах хүн сонгох боломжгүй байна`,
                400
            );
        }
        userId = recieveUser[0].id;
    } else {
        console.log(workflow_template.roleId + " роль хүртэл давтах");
        console.log(itemCreatedUser.roleId + " миний роль");
        let currentOrg = itemCreatedUser.organizationId;
        for (let index = itemCreatedUser.roleId+1; index >= workflow_template.roleId; index--) {
            let myOrganization = await req.db.organizations.findByPk(currentOrg);
            let parent = await req.db.organizations.findByPk(myOrganization.parent_id);
            if (parent.level_id === workflow_template.roleId) {
                let recieveUser = await req.db.users.findAll({
                    where: {
                        organizationId: parent.id,
                    },
                });
                if (recieveUser.length === 0) {
                    throw new MyError(
                         `Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`,
                        400
                    );
                }

                if (recieveUser[1]) {
                    throw new MyError(
                         `${workflow_template.organizationId} алба нэгж дээр 1 ээс олон хүн бүртгэгдсэн тул хүлээн авах хүн сонгох боломжгүй байна`,
                        400
                    );
                }
                userId = recieveUser[0].id;
                break;
            }
            currentOrg=parent.id
        }
        if (!userId) {
            throw new MyError(
                 `Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`,
                400
            );
        }
    }

    console.log(`Хүлээн авах хэрэглэгч: ${userId}`.green);
    return userId;
})
