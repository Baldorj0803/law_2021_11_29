
const { createUser } = require('../controller/users');
const asyncHandler = require('../middleware/asyncHandle');
const organizations = require('../models/organizations');
const MyError = require("../utils/myError")


exports.getWorkflowTemplate = asyncHandler(async (req, item, step) => {

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
    console.log(`${lastTemplate.step} дамжлагын сүүлийн алхам`);
    console.log(`${step} алхамын утгуудыг олох`);
    if (!lastTemplate) throw new MyError(`${item.workflowId} id тай дамжлага дээр сүүлийн дамжлага тохируулаагүй байна`)
    if (lastTemplate.step >= step) {
        for (let index = step; index <= lastTemplate.step; index++) {
            console.log(`${step} алхам дээр шалгалт хийлээ`.blue);
            //Дараагийн алхамд шалгагдад workflow ийн template
            let checkWorkflowTemplate = await req.db.workflow_templates.findOne({
                where: {
                    workflowId: item.workflowId,
                    step: index,
                },
            });

            if (checkWorkflowTemplate.roleId && checkWorkflowTemplate.organizationId) {
                //org зааж өгсөн бол заавал дамжина
                workflow_template = checkWorkflowTemplate
                console.log(`орг зааж өгсөн тул ${workflow_template.step} алхамд шууд дамжлаа`.bgMagenta);
                break;
            } else if (checkWorkflowTemplate.roleId >= createUser.roleId && !checkWorkflowTemplate.organizationId) {
                console.log(`${step} алхам дээр надаас бага рольтой ерөнхйигөөр заагдсан тул алгаслаа`);
                console.log("Ерөнхийгөөр заагдсан, надаас бага/ижил/ рольтой тул дараагийн алхамыг шалгах")
            } else if (checkWorkflowTemplate.roleId && !checkWorkflowTemplate.organizationId) {
                //ерөнхийгөөр зааж өгсөн
                //иймээс үүсгэсэн хэрэглэгчийн роль оос олно
                if (checkWorkflowTemplate.roleId < itemCreatedUser.roleId) {
                    //Шалгагдаж байгаа оргийн роль үүсгэсэн хэрэглэгчийн ролиос бага байх, шалгагдаж байгаа оргийн эцэг нь 0 биш байх
                    let myorganization = await req.db.organizations.findByPk(itemCreatedUser.organizationId);
                    let checkedOrg = await req.db.organizations.findByPk(myorganization.parent_id);
                    while (checkedOrg.roleId < itemCreatedUser.roleId && checkedOrg.parent_id !== 0) {
                        console.log(checkedOrg.id + ":Дээр шалгалаа");
                        console.log(checkedOrg.roleId + "+" + checkWorkflowTemplate.roleId);
                        if (checkedOrg.roleId === checkWorkflowTemplate.roleId) {
                            workflow_template = checkWorkflowTemplate;
                            break;
                        } else {
                            checkedOrg = await req.db.organizations.findByPk(checkedOrg.parent_id);
                            if (!checkedOrg) break;
                        }
                    }
                } else {
                    console.log(`Шалгах роль /${checkWorkflowTemplate.roleId}/  нь үүсгэсэн хэрэглэгчийн роль ${itemCreatedUser.roleId} оос бага тул алгаслаа `.red)
                }
            }
            if (workflow_template) break;
        }
    } else if (lastTemplate.step <= step) {
        console.log("Сүүлийн дамжлага байсан учир дараагийн дамжлагыг тооцоолсонгүй".bgGreen)
        //Энэ нөхцөл тэнцүү үед сүүлийн алхам байх бөгөөд дараагийн алхамыг тооцоолох шаардлагагүй
        return 0;
    }
    if (!workflow_template) {
        throw new MyError(`Дараагийн шатны дамжлага олдсонгүй`,
            400
        );
    }
    console.log(`Дараагийн шат-${workflow_template.id}, ${workflow_template.organizationId} - албан тушаалд`.green)
    return workflow_template.id

})

exports.recieveUser = asyncHandler(async (req, workflow_template, item) => {
    const itemCreatedUser = await req.db.users.findByPk(item.userId);

    if (!itemCreatedUser) throw new MyError(`Энэхүү файлыг үүсгэсэн хэрэглсэг байхгүй байна`)

    // !!! read me
    // өндөр роль 0 , бага 10... гэж тооцоологдоно

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
        if (recieveUser.length[1]) {
            // throw new MyError(
            //     `${workflow_template.organizationId} алба нэгж дээр 1 ээс олон хүн бүртгэгдсэн тул хүлээн авах хүн сонгох боломжгүй байна`,
            //     400
            // );

            //Тухайн алба дээр 1 ээс олон хүн байгаа бөгөөд аль салбарт хамаарайлтай хүмүүсээс хайна
            let u = recieveUser.filter(u => u.branchId);
            if (!u) throw new MyError(`${workflow_template.organizationId} алба нэгж дээр 1 ээс олон хүн бүртгэгдсэн тул хүлээн авах хүн сонгох боломжгүй байна`, 400);

            //users ээс аль вальют сонгосноор хайх

        }
        userId = recieveUser[0].id;
    } else {
        console.log(workflow_template.roleId + " роль хүртэл давтах");
        console.log(itemCreatedUser.roleId + " миний роль");
        let currentOrg = itemCreatedUser.organizationId;
        for (let index = itemCreatedUser.roleId + 1; index >= workflow_template.roleId; index--) {
            let myOrganization = await req.db.organizations.findByPk(currentOrg);
            let parent = await req.db.organizations.findByPk(myOrganization.parent_id);
            if (parent.roleId === workflow_template.roleId) {
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
            currentOrg = parent.id
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
