const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const variable = require('../config/const')
const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')

module.exports = asyncHandler(async (req, itemId) => {

    const item = await req.db.items.findOne({
        where: {
            id: itemId,
            reqStatusId: variable.APPROVED,
        }
    });
    if (!item) throw new MyError("Дамжуулсан утга буруу байна", 400);
    const user = await req.db.users.findByPk(item.userId);
    if (!user) throw new MyError("Хэрэглэгч олдсонгүй", 400)

    let query = `select u.organizationId,wt.roleId,u.name,wt.step,wt.workflowId,w.workflowTypeId,tt.id as templateOrgId,w.confirmTemplateFileName
    from request r
    left join users u on r.modifiedBy=u.id
    left join workflow_templates wt on r.workflowTemplateId=wt.id
    left join workflows w on wt.workflowId=w.id
    left join (
    select count(*),wt.id as idd,wo.* from workflow_templates wt
    left join workfloworganizations wo on wt.id=wo.workflowTemplateId
    group by workflowId ,step) as tt on tt.idd=wt.id
    where r.reqStatusId =${variable.COMPLETED} and r.itemId=${item.id}
    order by wt.step asc ;`

    let query2 = `select i.id,w.workflowTypeId,count(wt.id) as totalStep
    from items i
    left join workflows w on i.workflowId = w.id
    left join workflow_templates wt on w.id = wt.workflowId
    where i.id=${item.id}`;

    const [uResult2, uMeta2] = await req.db.sequelize.query(query2);
    let confirmTemplateFileName = (item.company === 1) ? 'gobi' : 'ohin';
    confirmTemplateFileName = confirmTemplateFileName + uResult2[0].totalStep + '.docx'
    let content;
    if (uResult2[0].workflowTypeId === 2) {
        content = fs.readFileSync(
            path.resolve(process.env.FILE_PATH + "/confirmTemplate/", "songon.docx"),
            "binary"
        );
    } else if (item.company === 1) {
        content = fs.readFileSync(
            path.resolve(process.env.FILE_PATH + "/confirmTemplate/", confirmTemplateFileName),
            "binary"
        );
    } else {
        content = fs.readFileSync(
            path.resolve(process.env.FILE_PATH + "/confirmTemplate/", confirmTemplateFileName),
            "binary"
        );
    }
    const [uResult, uMeta] = await req.db.sequelize.query(query);

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });


    let tergvvn = uResult.filter(i => i.organizationId === 1);
    let sanhvv = uResult.filter(i => i.organizationId === 12);
    let huuli = uResult.filter(i => i.organizationId === 16 || i.organizationId === 110);
    let ded = uResult.filter(i => (i.templateOrgId === null && i.roleId === 2));
    let gazriin = uResult.filter(i => (i.templateOrgId === null && i.roleId === 3 && i.step == 2));
    let ccx = uResult.filter(i => (i.organizationId === 4));
    let ohin = uResult.filter(i => (i.organizationId === 7 || i.organizationId === 6 || i.organizationId === 5));
    let songon = uResult.filter(i => (i.workflowTypeId === 2));
    let bichighereg = uResult.filter(i => (i.organizationId === 72));


    let h12 = (huuli.length > 0) ? "Тийм" : "Үгүй";
    let h22 = (gazriin.length > 0) ? "Тийм" : "Үгүй";
    let h32 = (ohin.length > 0) ? "Тийм" : "Үгүй";
    let h42 = (sanhvv.length > 0) ? "Тийм" : "Үгүй";
    let h52 = (ded.length > 0) ? "Тийм" : "Үгүй";
    let h62 = (ccx.length > 0) ? "Тийм" : "Үгүй";
    let h72 = (tergvvn.length > 0) ? "Тийм" : "Үгүй";
    bichighereg = (bichighereg.length > 0) ? "Тийм" : "Үгүй";

    songon = (songon.length > 0) ? "Тийм" : "Үгүй";
    let fullName = user.name;
    if (user.lastname && user.lastname !== "") fullName = user.lastname.charAt(0) + "." + user.name;

    if (item.company === 1) {
        doc.render({
            towchUtga: item.brfMean,
            custInf: item.custInfo,
            ajliinHuls: item.wage,
            NiilvvlehHugatsaa: item.execTime,
            batalgaatHugatsaa: (item.warrantyPeriod === "1") ? "Тийм" : "Үгүй",
            torguuli: (item.trmCont === "1") ? "Тийм" : "Үгүй",
            songonShalgaruulal: songon,
            h1: h12,
            h2: h22,
            h3: h32,
            h4: h42,
            h5: h52,
            h6: h62,
            h7: h72,
            date: new Date(),
            organization: fullName,
            bichighereg: bichighereg
        });
    } else {
        doc.render({
            gereegHariutsah: "",
            towchUtga: item.brfMean,
            custInf: item.custInfo,
            ajliinHuls: item.wage,
            NiilvvlehHugatsaa: item.execTime,
            batalgaatHugatsaa: (item.warrantyPeriod === "1") ? "Тийм" : "Үгүй",
            torguuli: (item.trmCont === "1") ? "Тийм" : "Үгүй",
            songonShalgaruulal: songon,
            h1: h12,
            h2: h22,
            h3: h32,
            h4: h42,
            h5: h52,
            h6: h62,
            h7: h72,
            date: new Date(),
            username: fullName,
            bichighereg: bichighereg
        });
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    let fileName = `zowshoorliin_huudas_${Date.now()}.docx`;

    let fileContents = Buffer.from(buf, "base64");
    let savedFilePath = process.env.FILE_PATH + "/confirmFile/" + fileName;
    fs.writeFile(savedFilePath, fileContents, function () {
        console.log(savedFilePath + " зам дээр зөвшөөрлийн файлыг хадгаллаа");
        // message = "file ийг амжилттай хууллаа";
        // res.download(savedFilePath, function (err) {
        //     if (err) {
        //         console.log(err);
        //         res.status(404).end()
        //     }
        // });
        return fileName;
    });
    return fileName;
})