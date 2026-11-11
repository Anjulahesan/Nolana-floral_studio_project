const { Order, Product, User, Counter } = require("../models");
const { ORDER_STATUSES } = require("../models/order.model");
const { HttpError } = require("../middleware/errorHandler");
const pick = require("../utils/pick");

const isAdmin = (req) => req.user.role === "admin";

// Loads an order and checks 
async function findOwnOrder(req) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, "Order not found");
  if (!isAdmin(req) && String(order.userId) !== String(req.user._id)) {
    throw new HttpError(403, "Forbidden: not your order");
  }
  return order;
}

// Prices are from products collection, not from the client
async function buildLines(items) {
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "items are required");

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) }, isActive: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return items.map((item, idx) => {
    const product = byId.get(String(item.productId));
    if (!product) throw new HttpError(400, `items[${idx}]: product not found or inactive`);
    const size = item.size ? product.sizes.find((s) => s.label === item.size) : product.sizes[0];
    if (!size) throw new HttpError(400, `items[${idx}]: size "${item.size}" not available`);
    const qty = item.qty === undefined ? 1 : Number(item.qty);
    return { productId: product._id, name: product.name, size: size.label, price: size.price, qty };
  });
}

function totals(lines, delivery) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  return { subtotal, total: subtotal + (Number(delivery?.fee) || 0) };
}

async function nextOrderNo() {
  const year = new Date().getFullYear();
  const seq = await Counter.next(`order-${year}`);
  return `FS-${year}-${String(seq).padStart(4, "0")}`;
}

// GET /api/orders?status=&deliveryDate=YYYY-MM-DD   
exports.list = async (req, res) => {
  const filter = isAdmin(req) ? {} : { userId: req.user._id };
  const { status, deliveryDate } = req.query;
  if (status) filter.status = status;
  if (deliveryDate) {
    const start = new Date(deliveryDate);
    if (isNaN(start)) throw new HttpError(400, "Invalid deliveryDate");
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter["delivery.date"] = { $gte: start, $lt: end };
  }
  res.json(await Order.find(filter).populate("userId", "fname lname email").sort({ createdAt: -1 }));
};

// GET /api/orders/:id  
exports.get = async (req, res) => {
  const order = await findOwnOrder(req);
  await order.populate([
    { path: "userId", select: "fname lname email contacts" },
    { path: "items.productId", select: "name images" },
  ]);
  res.json(order);
};

// POST /api/orders   customer orders
exports.create = async (req, res) => {
  const { items, delivery, cardMessage, payment } = req.body || {};
  const userId = isAdmin(req) && req.body.userId ? req.body.userId : req.user._id;
  if (!(await User.exists({ _id: userId }))) throw new HttpError(400, "userId does not exist");

  const lines = await buildLines(items);
  const order = await Order.create({
    orderNo: await nextOrderNo(),
    userId,
    items: lines,
    delivery,
    cardMessage,
    ...totals(lines, delivery),
    payment: pick(payment, ["method"]),
  });
  res.status(201).json(order);
};

// PATCH /api/orders/:id   
exports.update = async (req, res) => {
  const order = await findOwnOrder(req);
  if (order.status !== "pending") throw new HttpError(409, `Order is ${order.status} and can no longer be edited`);

  const { items, delivery, cardMessage } = req.body || {};
  if (items !== undefined) order.items = await buildLines(items);
  if (delivery !== undefined) order.delivery = { ...order.delivery.toObject(), ...delivery };
  if (cardMessage !== undefined) order.cardMessage = cardMessage;
  Object.assign(order, totals(order.items, order.delivery));

  await order.save();
  res.json(order);
};

// PATCH /api/orders/:id/status  
exports.updateStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    throw new HttpError(400, `status must be one of: ${ORDER_STATUSES.join(", ")}`);
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
  if (!order) throw new HttpError(404, "Order not found");
  res.json(order);
};

// PATCH /api/orders/:id/cancel   
exports.cancel = async (req, res) => {
  const order = await findOwnOrder(req);
  if (order.status !== "pending") throw new HttpError(409, `Order is ${order.status} and cannot be cancelled`);
  order.status = "cancelled";
  await order.save();
  res.json(order);
};

// DELETE /api/orders/:id   
exports.remove = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new HttpError(404, "Order not found");
  res.status(204).end();
};

// GET /api/orders/reports/top-products   
exports.topProducts = async (req, res) => {
  res.json(
    await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", name: { $first: "$items.name" }, sold: { $sum: "$items.qty" } } },
      { $sort: { sold: -1 } },
      { $limit: Number(req.query.limit) || 5 },
    ])
  );
};