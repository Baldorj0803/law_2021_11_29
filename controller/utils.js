
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const email = require('../utils/email')


exports.getcontracttypes = asyncHandler(async (req, res, next) => {

    const sort = req.query.sort;
    let select = req.query.select;

    if (select) {
        select = select.split(" ");
    }

    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

    let query = {}
    if (req.query) {
        let key = Object.keys(req.query)
        let value = Object.values(req.query)
        console.log(key, value);
        query.where = {}
        key.map((k, i) => {
            query.where[k] = {}
            if (value[i] === "null") {
                query.where[k] = null
            } else {
                query.where[k] = value[i]
            }
        })
    }


    if (select) {
        query.attributes = select;
    }

    if (sort) {
        query.order = sort
            .split(" ")
            .map((el) => [
                el.charAt(0) === "-" ? el.substring(1) : el,
                el.charAt(0) === "-" ? "DESC" : "ASC",
            ]);
    }

    const contractTypes = await req.db.contractTypes.findAll(query);

    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: contractTypes,
    });
});



exports.sendEmail = asyncHandler(async (req, res, next) => {
    if (!req.body.to) throw new MyError(`Илгээх email оруулна уу /to/`, 400);

    let info = await email({
        subject: 'Хуулийн гэрээ байгуулах тухай',
        to: req.body.to,
    })
    console.log(`${JSON.stringify(info.accepted)} хэрэглэгчид емэйл илгээгдлээ`.green);

    res.status(200).json({
        code: res.statusCode,
        message: "success",
        data: info,
    });
});