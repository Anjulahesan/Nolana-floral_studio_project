const { Category, Product } = require("../models");
const { HttpError } = require("../middleware/errorHandler");
const pick = require("../utils/pick");

const FIELDS = ["name", "slug", "description", "isActive"];

exports.list = async (req, res) => {
  res.json(await Category.find().sort({ name: 1 }));
};

exports.get = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new HttpError(404, "Category not found");
  res.json(category);
};

exports.create = async (req, res) => {
  res.status(201).json(await Category.create(pick(req.body, FIELDS)));
};

exports.update = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
    returnDocument: "after",
    runValidators: true,
  });
  if (!category) throw new HttpError(404, "Category not found");
  res.json(category);
};

exports.remove = async (req, res) => {
  if (await Product.exists({ categoryId: req.params.id })) {
    throw new HttpError(409, "Category still has products");
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new HttpError(404, "Category not found");
  res.status(204).end();
};