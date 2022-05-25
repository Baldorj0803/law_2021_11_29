const asyncHandler = require("../middleware/asyncHandle");
const MyError = require("../utils/myError");
const color = require("colors");
const { Op } = require("sequelize");

exports.getWorkflowTemplate = asyncHandler(async (req, item, step) => {
  let returnObj = {
    workflowTemplateId: null,
    userIds: null,
  };
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

      //Дамжлага дээр холбоотой албан тушаал байгаагаас шалтгаалж ерөнхийгөөр эсэхийг тодорхойлов
      let orgCnt = await checkWorkflowTemplate.countWorkflowOrganizations();
      if (checkWorkflowTemplate.roleId && orgCnt > 0) {
        let orgs = await checkWorkflowTemplate.getWorkflowOrganizations({
          attributes: ["organizationId"],
          raw: true,
        });

        let orgIds = orgs.map((i) => i.organizationId);
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
        if (lastTemplate.step === step) return 0;
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

          console.log(
            `${checkedOrg.roleId}-${itemCreatedUser.roleId}-${checkedOrg.parent_id}`
          );
          while (
            checkedOrg.roleId < itemCreatedUser.roleId &&
            checkedOrg.parent_id >= 0
          ) {
            console.log(checkedOrg.id + ":Дээр шалгалаа");
            console.log(
              checkedOrg.roleId + "===" + checkWorkflowTemplate.roleId
            );

            //Тэргүүн дэдийн ролийг 1 болсон учир дэд захиралгүй газрууд олж чадахгүй байсан
            if (checkWorkflowTemplate.roleId === 2 && checkedOrg.roleId === 1) {
              checkedOrg.roleId = 2;
              //дараагийн нөхцөлийг биелүүлэхийн тулд
            }

            if (checkedOrg.roleId === checkWorkflowTemplate.roleId) {
              //тухайн тэмплэйт дээрээс хүлээн авах хэрэглэгчийг олох
              console.log(
                `${checkWorkflowTemplate.id} id-тай тэмплэйтээс хүлээн авах хэрэглэгчийг олно`
                  .yellow
              );
              let user = await this.recieveUser(
                req,
                checkWorkflowTemplate,
                item
              );
              let isDuplicate = await req.db.recieveUsers.findAll({
                attributes: ["userId"],
                where: {
                  userId: { [Op.in]: user },
                },
                include: {
                  model: req.db.request,
                  where: { itemId: item.id },
                },
                raw: true,
              });

              isDuplicate = isDuplicate.map((i) => i["userId"]);

              if (isDuplicate.length > 0) {
                console.log(
                  `${JSON.stringify(isDuplicate)} хэрэглэгч дээр ${
                    item.id
                  } id-тай гэрээний хүсэлт ирж байсан тул ${
                    checkWorkflowTemplate.id
                  } id-тай тэмплэйт дээр хүлээн авах хэрэглэгчээс хаслаа.`
                    .yellow
                );
              }
              let realRecieveUser = user.filter(
                (x) => !isDuplicate.includes(x)
              );
              console.log(`realRecieveUser:${realRecieveUser}`.magenta);
              if (realRecieveUser.length > 0) {
                workflow_template = checkWorkflowTemplate;
                returnObj.userIds = realRecieveUser;
                break;
              } else
                console.log(
                  `Энэ хэрэглэгч дээр хүсэлт ирсэн байсан тул алгаслаа`.red
                );
              console.log(returnObj);
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
    if (returnObj.userIds === null && returnObj.workflowTemplateId === null) {
      return 0;
    }
    throw new MyError(`Дараагийн шатны дамжлага олдсонгүй`, 400);
  }
  console.log(
    `Дараагийн шат-${workflow_template.id}, ${workflow_template.organizationId} - албан тушаалд`
      .green
  );

  returnObj.workflowTemplateId = workflow_template.id;
  return returnObj;
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
    let orgs = await workflow_template.getWorkflowOrganizations({
      attributes: ["organizationId"],
      raw: true,
    });
    // let orgIds = orgs.map(i => i.organizationId);
    // Эрх шилжүүлэх код
    let orgIds = orgs.map((i) => {
      if (i.organizationId === 1) {
        return 3;
      } else return i.organizationId;
    });
    let recieveUser = await req.db.users.findAll({
      where: {
        organizationId: orgIds,
      },
      raw: true,
    });

    if (recieveUser.length === 0) {
      throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
    }
    userId = recieveUser.map((i) => i.id);
  } else {
    console.log(itemCreatedUser.roleId + " миний роль");
    console.log(workflow_template.roleId + " роль хүртэл давтах");
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
      console.log(`${parent.roleId}`.bgMagenta);
      if (
        parent.roleId === workflow_template.roleId ||
        (workflow_template.roleId === 2 && parent.roleId === 1)
      ) {
        //Эрх шилжүүлэх код
        let searchId = parent.id;
        if (searchId === 8) searchId = 44;
        // console.log(`тэргүүн байсан тул org солив.==${searchId}`.bgYellow);
        let recieveUser = await req.db.users.findAll({
          where: {
            //Эрх шилжүүлэх код
            organizationId: searchId,
            // organizationId: parent.id
          },
          raw: true,
        });
        if (recieveUser.length === 0) {
          throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
        }

        userId = recieveUser.map((i) => i.id);
        break;
      }
      currentOrg = parent.id;
    }
    if (!userId.length === 0) {
      throw new MyError(`Хүсэлтийг хүлээн авах хэрэглэгч олдсонгүй`, 400);
    }
  }
  userId = userId.filter((i) => i !== itemCreatedUser.id);
  console.log(`Хүлээн авах хэрэглэгч: ${userId}`.green);
  return userId;
});
