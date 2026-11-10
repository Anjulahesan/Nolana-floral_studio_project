const { Product, Category } = require("../models/product.model.js");
const { HttpError } = require("../middleware/errorHandler");
const pick = require("../utils/pick");

const FIELDS = ["name", "description", "categoryId", "flowers", "colors", "occasions", "sizes", "images", "isActive"];

async function assertCategory(categoryId) {
  if (categoryId && !(await Category.exists({ _id: categoryId }))) {
    throw new HttpError(400, "categoryId does not exist");
  }
}


exports.list = async (req, res) => {
  const filter = {};
  const { category, occasion, q, active } = req.query;

  if (category) {
    const cat = await Category.findOne(
      /^[a-f\d]{24}$/i.test(category) ? { _id: category } : { slug: String(category).toLowerCase() }
    );
    if (!cat) return res.json([]);
    filter.categoryId = cat._id;
  }
  if (occasion) filter.occasions = occasion;
  if (active !== undefined) filter.isActive = active === "true";
  if (q) filter.$text = { $search: q };

  res.json(await Product.find(filter).populate("categoryId", "name slug").sort({ name: 1 }));
};

exports.get = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("categoryId", "name slug");
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
};

exports.create = async (req, res) => {
  const data = pick(req.body, FIELDS);
  await assertCategory(data.categoryId);
  res.status(201).json(await Product.create(data));
};

exports.update = async (req, res) => {
  const data = pick(req.body, FIELDS);
  await assertCategory(data.categoryId);
  const product = await Product.findByIdAndUpdate(req.params.id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
};


exports.remove = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!product) throw new HttpError(404, "Product not found");
  res.status(204).end();
};