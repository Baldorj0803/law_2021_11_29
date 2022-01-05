const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const color = require("colors");
const { Op } = require("sequelize");

exports.getWorkflowTemplate = asyncHandler(async (req, item, step) => {
  const itemCreatedUser = await req.db.users.findByPk(item.userId);

  if (!itemCreatedUser)
    throw new MyError(`Энэхүү гэрээг үүсгэсэн хэрэглэгч байхгүй байна`);

  let workflow_template;

  //Тухайн итемд хамаарах workflow ийн сүүлийн алхамыг олох
  // let range = await req.db.ranges.findByPk(item.rangeId);
  let lastTemplate = await req.db.workflow_templates.findOne({
    where: {
      workflowId: item.workflowId,
      is_last: 1,
    },
  });
  console.log(`${lastTemplate.step} дамжлагын сүүлийн алхам`);
  console.log(`${step} алхамын утгуудыг олох`);
  if (!lastTemplate)
    throw new MyError(
      `${item.workflowId} id тай дамжлага дээр сүүлийн дамжлага тохируулаагүй байна`
    );
  if (lastTemplate.step >= step) {
    for (let index = step; index <= lastTemplate.step; index++) {
      console.log(`${index} алхам дээр шалгалт хийлээ`.blue);
      //Дараагийн алхамд шалгагдад workflow ийн template
      let checkWorkflowTemplate = await req.db.workflow_templates.findOne({
        where: {
          workflowId: item.workflowId,
          step: index,
        },
      });

      let orgCnt = await checkWorkflowTemplate.countWorkflowOrganizations();
      if (checkWorkflowTemplate.roleId && orgCnt > 0) {
        let orgs = await checkWorkflowTemplate.getWorkflowOrganizations(
          {
            attributes: ['organizationId'],
            raw: true
          }
        )

        let orgIds = orgs.map(i => i.organizationId);
        // let a = await checkWorkflowTemplate.getWorkflowOrganizations({
        //   attributes: ['foo']
        // });
        //org зааж өгсөн бол заавал дамжина
        // workflow_template = checkWorkflowTemplate
        console.log(
          `орг зааж өгсөн тул ${checkWorkflowTemplate.step} алхамд шууд дамжлаа`
            .bgMagenta
        );

        let q = `select count(*) as user
        from recieveusers ru
        left join users u on ru.userId=u.id
        left join request r on ru.requestId=r.id
        where itemId=${item.id} and  u.organizationId in (${orgIds}) 
        and u.id is not null and r.id is not null`;
        const [uResult, uMeta] = await req.db.sequelize.query(q);
        if (uResult[0].user === 0) {
          workflow_template = checkWorkflowTemplate;
          break;
        }
        console.log(
          `Өмнөх алхамд энэ алхам дээр очсон тул алгаслаа,Ерөнхий`.bgCyan
        );
      } else if (checkWorkflowTemplate.roleId && orgCnt === 0) {
        //ерөнхийгөөр зааж өгсөн
        //иймээс үүсгэсэн хэрэглэгчийн роль оос олно
        if (checkWorkflowTemplate.roleId < itemCreatedUser.roleId) {
          //Шалгагдаж байгаа оргийн роль үүсгэсэн хэрэглэгчийн ролиос бага байх, шалгагдаж байгаа оргийн эцэг нь 0 биш байх
          let myorganization = await req.db.organizations.findByPk(
            itemCreatedUser.organizationId
          );
          let checkedOrg = await req.db.organizations.findByPk(
            myorganization.parent_id
          );
          while (
            checkedOrg.roleId < itemCreatedUser.roleId &&
            checkedOrg.parent_id !== 0
          ) {
            console.log(checkedOrg.id + ":Дээр шалгалаа");
            console.log(checkedOrg.roleId + "+" + checkWorkflowTemplate.roleId);
            if (checkedOrg.roleId === checkWorkflowTemplate.roleId) {
              let user = await this.recieveUser(
                req,
                checkWorkflowTemplate,
                item
              );

              let isDuplicate = await req.db.request.findAll({
                where: {
                  itemId: item.id,
                  recieveUser: { [Op.notIn]: user },
                },
              });
              if (!isDuplicate) {
                workflow_template = checkWorkflowTemplate;
                break;
              } else
                console.log(
                  `Энэ хэрэглэгч дээр хүсэлт ирсэн байсан тул алгаслаа`.red
                );
              break;
            } else {
              checkedOrg = await req.db.organizations.findByPk(
                checkedOrg.parent_id
              );
              if (!checkedOrg) break;
            }
          }
        } else {
          console.log(
            `Шалгах роль /${checkWorkflowTemplate.roleId}/  нь үүсгэсэн хэрэглэгчийн роль/ ${itemCreatedUser.roleId}/ оос бага тул алгаслаа `
              .red
          );
        }
      }
      if (workflow_template) {
        workflow_template = checkWorkflowTemplate;
        break;
      }
    }
  } else if (lastTemplate.step <= step) {
    console.log(
      "Сүүлийн дамжлага байсан учир дараагийн дамжлагыг тооцоолсонгүй".bgGreen
    );
    //Энэ нөхцөл тэнцүү үед сүүлийн алхам байх бөгөөд дараагийн алхамыг тооцоолох шаардлагагүй
    return 0;
  }
  if (!workflow_template) {
    throw new MyError(`Дараагийн шатны дамжлага олдсонгүй`, 400);
  }
  console.log(
    `Дараагийн шат-${workflow_template.id}, ${workflow_template.organizationId} - албан тушаалд`
      .green
  );
  return workflow_template.id;
});

exports.recieveUser = asyncHandler(async (req, workflow_template, item) => {
  const itemCreatedUser = await req.db.users.findByPk(item.userId);

  if (!itemCreatedUser)
    throw new MyError(`Энэхүү файлыг үүсгэсэн хэрэглсэгч байхгүй байна`);

  // !!! read me
  // өндөр роль 0 , бага 10... гэж тооцоологдоно

  let orgCnt = await workflow_template.countWorkflowOrganizations();
  let userId = [];
  // ---------------Орг байвал 1 хүн байна
  // ---------------Орг байхгүй бол олон хүн байна
  if (
    workflow_template &&
    // workflow_template.organizationId &&
    // workflow_template.organizationId !== null
    orgCnt > 0
  ) {
    //Нэг org байна /Тэр газрын захирал/
    let orgs = await workflow_template.getWorkflowOrganizations(
      {
        attributes: ['organizationId'],
        raw: true
      }
    )

    let orgIds = orgs.map(i => i.organizationId);
    let recieveUser = await req.db.users.findAll({
      where: {
        organizationId: orgIds,
      },
      raw: true
    });

    if (recieveUser.length === 0) {
      throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
    }
    userId = recieveUser.map(i => i.id);
  } else {
    console.log(workflow_template.roleId + " роль хүртэл давтах");
    console.log(itemCreatedUser.roleId + " миний роль");
    let currentOrg = itemCreatedUser.organizationId;
    for (
      let index = itemCreatedUser.roleId + 1;
      index >= workflow_template.roleId;
      index--
    ) {
      let myOrganization = await req.db.organizations.findByPk(currentOrg);
      let parent = await req.db.organizations.findByPk(
        myOrganization.parent_id
      );
      if (parent.roleId === workflow_template.roleId) {
        let recieveUser = await req.db.users.findAll({
          where: {
            organizationId: parent.id,
          },
        });
        if (recieveUser.length === 0) {
          throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
        }

        if (recieveUser[1]) {
          throw new MyError(
            `${workflow_template.organizationId} алба нэгж дээр 1 ээс олон хүн бүртгэгдсэн тул хүлээн авах хүн сонгох боломжгүй байна`,
            400
          );
        }
        userId.push(recieveUser[0].id)
        break;
      }
      currentOrg = parent.id;
    }
    if (!userId.length === 0) {
      throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
    }
  }
  console.log(`Хүлээн авах хэрэглэгч: ${userId}`.green);
  return userId;
});
