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

    let query = `select wt.organizationId,wt.roleId,u.name,wt.step,wt.workflowId
    from request r
    left join users u on r.modifiedBy=u.id
    left join workflow_templates wt on r.workflowTemplateId=wt.id
    where r.reqStatusId =${variable.COMPLETED}`


    const [uResult, uMeta] = await req.db.sequelize.query(query);

    let content;
    if (item.company === 1) {
        content = fs.readFileSync(
            path.resolve(process.env.FILE_PATH + "/confirmTemplate/", "gobi.docx"),
            "binary"
        );
    } else {
        content = fs.readFileSync(
            path.resolve(process.env.FILE_PATH + "/confirmTemplate/", "gobiOhin.docx"),
            "binary"
        );
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    let tergvvn = uResult.filter(i => i.organizationId === 1);
    let sanhvv = uResult.filter(i => i.organizationId === 12);
    let huuli = uResult.filter(i => i.organizationId === 16);
    let ded = uResult.filter(i => (i.organizationId === null && i.roleId === 2));
    let gazriin = uResult.filter(i => (i.organizationId === null && i.roleId === 3));
    let ccx = uResult.filter(i => (i.organizationId === 4));
    let ohin = uResult.filter(i => (i.organizationId === 7 || i.organizationId === 6 || i.organizationId === 5));
    let songon = uResult.filter(i => (i.workflowId === 2));

    let h12 = (huuli.length > 0) ? "Тийм" : "Үгүй";
    let h22 = (gazriin.length > 0) ? "Тийм" : "Үгүй";
    let h32 = (ohin.length > 0) ? "Тийм" : "Үгүй";
    let h42 = (sanhvv.length > 0) ? "Тийм" : "Үгүй";
    let h52 = (ded.length > 0) ? "Тийм" : "Үгүй";
    let h62 = (ccx.length > 0) ? "Тийм" : "Үгүй";
    let h72 = (tergvvn.length > 0) ? "Тийм" : "Үгүй";

    songon = (songon.length>0)?"Тийм":"Үгүй";
    console.log(songon);

    if (item.company === 1) {
        doc.render({
            test: "ene bol test",
            towchUtga: item.brfMean,
            custInf: item.custInfo,
            ajliinHuls: item.wage,
            NiilvvlehHugatsaa: item.execTime,
            batalgaatHugatsaa: (item.warrantyPeriod === "1") ? "Тийм" : "Үгүй",
            torguuli: (item.trmCont === "1") ? "Тийм" : "Үгүй",
            songonShalgaruulal: songon,
            h1:h12,
            h2:h22,
            h3:h32,
            h4:h42,
            h5:h52,
            h6:h62,
            h7:h72,
            date: new Date(),
            organization: user.name,
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
            username: user.name,
        });
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    let fileName = `file_${Date.now()}.docx`;

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