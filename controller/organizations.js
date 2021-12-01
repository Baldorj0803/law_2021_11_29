
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { Op } = require("sequelize");


exports.getOrganizations = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  let query={}
  if (req.query) {
    let key = Object.keys(req.query)
    let value = Object.values(req.query)
    query.where = {}
    key.map((k, i) => {
      query.where[k]={}
      query.where[k][Op.like] = `%${value[i]}%`
    })
  }

  const pagination = await paginate(page, limit, req.db.users,query);

   query= {...query, offset: pagination.start - 1, limit };

  

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

  const organizations = await req.db.organizations.findAll(query);

  res.status(200).json({
    code: res.statusCode,
    message: "success",
    data: organizations,
    pagination,
  });
});