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

    let query = `select wt.organizationId,wt.roleId,u.name,wt.step
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

    let zahiral = uResult.filter(i => i.organizationId === 1);
    (zahiral.length > 0) ? zahiral = zahiral[0].name : "";
    let sanhvv = uResult.filter(i => i.organizationId === 12);
    (sanhvv.length > 0) ? sanhvv = sanhvv[0].name : "";
    let huuli = uResult.filter(i => i.organizationId === 16);
    (huuli.length > 0) ? huuli = huuli[0].name : "";

    if (item.company === 1) {
        doc.render({
            towchUtga: item.brfMean,
            hariltsMedleelel: item.custInfo,
            ajliinHuls: item.wage,
            NiilvvlehHugatsaa: item.execTime,
            batalgaatHugatsaa: (item.warrantyPeriod === "1") ? "Тийм" : "Үгүй",
            torguuli: (item.trmCont === "1") ? "Тийм" : "Үгүй",
            songonShalgaruulal: "",
            gereegHariutsah: user.name,
            gazriinZahiral: "Тийм",
            huuliinHeltes: (huuli) ? "Тийм" : "Үгүй",
            sanhvvHariutsan: (sanhvv) ? "Тийм" : "Үгүй",
            dedZahiral: "Тийм" ,
            CCTXD: "",
            tergvvnDed: (zahiral) && "Тийм",
            date: new Date(),
            organization: user.name,
        });
    } else {
        doc.render({
            towchUtga: item.brfMean,
            hariltsMedleelel: item.custInfo,
            ajliinHuls: item.wage,
            NiilvvlehHugatsaa: item.execTime,
            batalgaatHugatsaa: (item.warrantyPeriod === "1") ? "Тийм" : "Үгүй",
            torguuli: (item.trmCont === "1") ? "Тийм" : "Үгүй",
            songonShalgaruulal: "",
            gereegHariutsah: user.name,
            gazriinZahiral: "towchUtga",
            huuliinHeltes: "towchUtga",
            sanhvvHariutsan: "towchUtga",
            dedZahiral: "towchUtga",
            CCTXD: "towchUtga",
            tergvvnDed: "towchUtga",
            date: new Date(),
            organization: "towchUtga",
        });
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    let fileName = `file_${Date.now()}.docx`;

    let fileContents = Buffer.from(buf, "base64");
    let savedFilePath = process.env.FILE_PATH + "/confirmFile/" + fileName;
    fs.writeFile(savedFilePath, fileContents, function () {
        console.log(savedFilePath +" зам дээр зөвшөөрлийн файлыг хадгаллаа");
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