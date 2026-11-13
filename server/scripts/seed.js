require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const { Category, Product, User, Order, Counter } = require("../src/models");

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([Order, Product, Category, User, Counter].map((M) => M.deleteMany({})));

  const [bouquets, wedding, gifts, custom] = await Category.create([
    { name: "Bouquets", slug: "bouquets", description: "Hand-tied bouquets for every occasion" },
    { name: "Wedding", slug: "wedding", description: "Bridal bouquets, boutonnieres, and decor" },
    { name: "Gifts", slug: "gifts", description: "Gift baskets, chocolates and more" },
    { name: "Custom", slug: "custom", description: "Create your own arrangement" },
  ]);

  const [redRose, pastel, whiteBridal, orchid] = await Product.create([
    {
      name: "Red Rose Classic",
      description: "12 long-stemmed red roses with eucalyptus",
      categoryId: bouquets._id,
      flowers: ["Rose", "Eucalyptus"],
      colors: ["red", "green"],
      occasions: ["Anniversary", "Valentine's"],
      sizes: [{ label: "Standard", price: 4500 }, { label: "Deluxe", price: 6500 }],
    },
    {
      name: "Pastel Dream",
      description: "Soft pink lilies, carnations and baby's breath",
      categoryId: custom._id,
      flowers: ["Lily", "Carnation", "Baby's Breath"],
      colors: ["pink", "white"],
      occasions: ["Birthday", "Thank You"],
      sizes: [{ label: "Standard", price: 3800 }, { label: "Deluxe", price: 5200 }],
    },
    {
      name: "White Bridal Cascade",
      description: "A cascading bridal bouquet of white roses and orchids",
      categoryId: wedding._id,
      flowers: ["Rose", "Orchid"],
      colors: ["white"],
      occasions: ["Wedding"],
      sizes: [{ label: "Standard", price: 18000 }],
    },
    {
      name: "Phalaenopsis Orchid Pot",
      description: "Double-stemmed orchid in a ceramic pot",
      categoryId: gifts._id,
      flowers: ["Orchid"],
      colors: ["purple"],
      occasions: ["Housewarming", "Thank You"],
      sizes: [{ label: "Standard", price: 7500 }],
    },
  ]);

  const [amir, anjula, nevan, youchen] = await User.create([
    {
      fname: "Studio",
      lname: "Admin",
      email: "admin@floralstudio.test",
      password: "admin123",
      role: "admin",
    },
    {
      fname: "Amir",
      lname: "Najafi",
      email: "amir@example.com",
      contacts: [{ type: "mobile", value: "+1 416 789 1234" }],
      password: "amir123",
      addresses: [{ label: "Home", line1: "78 King St", city: "Toronto", isDefault: true }],
    },
    {
      fname: "Anjula",
      lname: "Gedara",
      email: "anjula@example.com",
      password: "anjula123",
      contacts: [{ type: "mobile", value: "+1 416 567 1234" }],
      addresses: [{ label: "Home", line1: "45 Galle Rd", city: "Toronto", isDefault: true }],
    },
    {
      fname: "Nevan",
      lname: "Newaz",
      email: "nevan@example.com",
      password: "nevan123",
      contacts: [{ type: "mobile", value: "+1 416 123 4567" }],
      addresses: [{ label: "Home", line1: "12 Lake Rd", city: "Toronto", isDefault: true }],
    },
    {
      fname: "Youchen",
      lname: "Cheng",
      email: "youchen@example.com",
      password: "youchen123",
      contacts: [{ type: "mobile", value: "+1 416 555 1234" }],
      addresses: [{ label: "Home", line1: "123 Main St", city: "Toronto", isDefault: true }],
    },
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
    amir._id,
    [
      { productId: redRose._id, name: redRose.name, size: "Deluxe", price: 6500, qty: 1 },
      { productId: orchid._id, name: orchid.name, size: "Standard", price: 7500, qty: 1 },
    ],
    {
      recipientName: "Alice Smith",
      recipientPhone: "+1 416 987 6543",
      address: { line1: "78 King St", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "10:00-12:00",
      fee: 500,
    },
    { cardMessage: "Happy anniversary!", payment: { method: "card", status: "paid" } }
  );

  await mkOrder(
    anjula._id,
    [{ productId: pastel._id, name: pastel.name, size: "Standard", price: 3800, qty: 2 }],
    {
      recipientName: "Bob Johnson",
      recipientPhone: "+1 416 654 3210",
      address: { line1: "456 Main St", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "14:00-16:00",
      fee: 400,
    },
    { cardMessage: "Happy birthday!" }
  );

  await mkOrder(
    nevan._id,
    [{ productId: whiteBridal._id, name: whiteBridal.name, size: "Standard", price: 18000, qty: 1 }],
    {
      recipientName: "Charlie Brown",
      recipientPhone: "+1 416 321 9876",
      address: { line1: "789 Queen St", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "16:00-18:00",
      fee: 600,
    },
    { cardMessage: "Congratulations on your wedding!", payment: { method: "bank_transfer", status: "unpaid" } }
  );

  await mkOrder(
    youchen._id,
    [{ productId: orchid._id, name: orchid.name, size: "Standard", price: 7500, qty: 1 }],
    {
      recipientName: "Daisy Williams",
      recipientPhone: "+1 416 432 1098",
      address: { line1: "321 King St", city: "Toronto", isDefault: true },
      date: tomorrow,
      timeSlot: "12:00-14:00",
      fee: 550,
    },
    { cardMessage: "Thinking of you!", payment: { method: "cash", status: "unpaid" } }
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
  .finally(() => mongoose.disconnect());