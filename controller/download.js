const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const variable = require("../config/const");

exports.getMyConfirmFile = asyncHandler(async (req, res, next) => {

    if (!req.params.itemId) {
        throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
    }

    let item = await req.db.items.findOne({
        where: {
            id: req.params.itemId,
            userId: req.userId
        }
    })

    if (!item) throw new MyError("Файл олдсонгүй")
    if (!item.confirmFile||item.confirmFile===null) throw new MyError("Файл олдсонгүй")

    res.download(process.env.FILE_PATH + `/confirmFile/${item.confirmFile}`, function (err) {
        if (err) {
            console.log(err);
            res.status(404).end()
        }
    });
})


//Батлгадсан гэрээг татах
exports.getConfirmFile = asyncHandler(async (req, res, next) => {

    if (!req.params.itemId) {
        throw new MyError("Файл эсвэл хүсэлт олдсонгүй", 400);
    }

    let item = await req.db.items.findOne({
        where:{
            id:req.params.itemId,
            reqStatusId:variable.APPROVED
        }
    })

    if (!item) throw new MyError("Файл олдсонгүй")
    if (!item.confirmFile||item.confirmFile===null) throw new MyError("Файл олдсонгүй")

    res.download(process.env.FILE_PATH + `/confirmFile/${item.confirmFile}`, function (err) {
        if (err) {
            console.log(err);
            res.status(404).end()
        }
    });


})