require("dotenv").config({ quiet: true });

const { connectDB, disconnectDB } = require("../src/config/config.js");
const { Category, Product, User, Order, Counter } = require("../src/models");

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([Order, Product, Category, User, Counter].map((M) => M.deleteMany({})));

  const [bouquets, wedding, sympathy, plants] = await Category.create([
    { name: "Bouquets", slug: "bouquets", description: "Hand-tied bouquets for every occasion" },
    { name: "Wedding", slug: "wedding", description: "Bridal bouquets, boutonnieres, and decor" },
    { name: "Gifts", slug: "gifts", description: "Gift baskets, chocolates and more" },
    { name: "Occasions", slug: "occasions", description: "Special arrangements for holidays and events" },
    { name: "Custom", slug: "custom", description: "Create your own arrangement" },
  ]);

  const [redRose, pastel, , , orchid] = await Product.create([
    {
      name: "Red Rose Classic",
      description: "12 long-stem red roses with eucalyptus",
      categoryId: bouquets._id,
      flowers: ["Rose", "Eucalyptus"],
      colors: ["red", "green"],
      occasions: ["Anniversary", "Valentine's"],
      sizes: [{ label: "Standard", price: 4500 }, { label: "Deluxe", price: 6500 }],
    },
    {
      name: "Pastel Dream",
      description: "Soft pink lilies, carnations and baby's breath",
      categoryId: bouquets._id,
      flowers: ["Lily", "Carnation", "Baby's Breath"],
      colors: ["pink", "white"],
      occasions: ["Birthday", "Thank You"],
      sizes: [{ label: "Standard", price: 3800 }, { label: "Deluxe", price: 5200 }],
    },
    {
      name: "White Bridal Cascade",
      description: "Cascading bridal bouquet of white roses and orchids",
      categoryId: wedding._id,
      flowers: ["Rose", "Orchid"],
      colors: ["white"],
      occasions: ["Wedding"],
      sizes: [{ label: "Standard", price: 18000 }],
    },
    {
      name: "Peaceful Wreath",
      description: "White chrysanthemum and lily standing wreath",
      categoryId: gifts._id,
      flowers: ["Chrysanthemum", "Lily"],
      colors: ["white"],
      occasions: ["Sympathy"],
      sizes: [{ label: "Standard", price: 12000 }],
    },
    {
      name: "Phalaenopsis Orchid Pot",
      description: "Double-stemmed orchid in a ceramic pot",
      categoryId: custom._id,
      flowers: ["Orchid"],
      colors: ["purple"],
      occasions: ["Housewarming", "Thank You"],
      sizes: [{ label: "Standard", price: 7500 }],
    },
  ]);

  const [youchen, nevan, anjula, amir] = await User.create([
    {
      fname: "Youchen",
      lname: "Cheng",
      email: "youchen@example.com",
      contacts: [{ type: "mobile", value: "+1 416 555 1234" }],
      addresses: [{ label: "Home", line1: "123 Main St", city: "Toronto", isDefault: true }]
    },
    {
      fname: "Nevan",
      lname: "Newaz",
      email: "nevan@example.com",
      contacts: [
        { type: "mobile", value: "+1 416 123 4567" }],
      addresses: [{ label: "Home", line1: "12 Lake Rd", city: "Toronto", isDefault: true }]
    },
    {
      fname: "Anjula",
      lname: "Gedara",
      email: "anjula@example.com",
      contacts: [{ type: "mobile", value: "+1 416 567 1234" }],
      addresses: [{ label: "Home", line1: "45 Galle Rd", city: "Toronto", isDefault: true }]
    },
        {
      fname: "Amir",
      lname: "Najafi",
      email: "amir@example.com",
      contacts: [{ type: "mobile", value: "+1 416 789 1234" }],
      addresses: [{ label: "Home", line1: "78 King St", city: "Toronto", isDefault: true }]
    }
  ]);

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = new Date().getFullYear();
  const mkOrder = async (userId, lines, delivery, extra = {}) => {
    const seq = await Counter.next(`order-${year}`);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return Order.create({
      orderNo: `FS-${year}-${String(seq).padStart(4, "0")}`,
      userId,
      items: lines,
      delivery,
      subtotal,
      total: subtotal + (delivery.fee || 0),
      ...extra,
    });
  };

  await mkOrder(
    youchen._id,
    [
      { productId: redRose._id, name: redRose.name, size: "Deluxe", price: 6500, qty: 1 },
      { productId: orchid._id, name: orchid.name, size: "Standard", price: 7500, qty: 1 },
    ],
    {
      recipientName: "Nevan Newaz",
      recipientPhone: "+1 416 123 4567",
      address: { line1: "12 Lake Rd", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "10:00-12:00",
      fee: 500,
    },
    { cardMessage: "Merry Christmas!", payment: { method: "card", status: "paid" } }
  );

  await mkOrder(
    anjula._id,
    [{ productId: pastel._id, name: pastel.name, size: "Standard", price: 3800, qty: 2 }],
    {
      recipientName: "Amir Najafi",
      recipientPhone: "+1 416 789 1234",
      address: { line1: "78 King St", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "14:00-16:00",
      fee: 400,
    },
    { cardMessage: "Happy Birthday!" }
  );

  const counts = await Promise.all(
    [Category, Product, User, Order].map(async (M) => `${M.collection.name}=${await M.countDocuments()}`)
  );
  console.log(`Seeded: ${counts.join(", ")}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(disconnectDB);