// const { User, Order } = require("../models");
// const { HttpError } = require("../middleware/errorHandler");
// const pick = require("../utils/pick");

const profile_fields = ["fname", "lname", "email", "contacts", "addresses"];

async function findUser(id) {
    const user = await User.findById(id);
    if (!user) throw new HttpError(404, "User not found");
    return user;
}

// GET /api/users       
exports.list = async (req, res) => {
    const filter = req.query.role ? { role: req.query.role } : {};
    res.json(await User.find(filter).sort({createdAt: -1})); 
};

// GET /api/users/:id       
exports.get = async (req, res) => {
    res.json(await findUser(req.params.id))
}

// POST /api/users      
exports.create = async (req, res) => {
    const user = await User.create(pick(req.body, [...profile_fields, "password", "role"]));
    res.status(201).json(user);
};

// PATCH /api/users/:id     (only admin can change role)
exports.update = async (req, res) => {
    const fields = req.user.role === "admin" ? [...profile_fields, "role"] : profile_fields;
    const user = await User.findByIdAndUpdate(req.params.id, pick(req.body, fields), 
    {
        retrunDocument: "after",
        runValidators: true,
    });

    if (!user) throw new HttpError(404, "User not found !");
    res.json(user);
};

// DELETE /api/users/:id    
exports.remove = async (req, res) => {
    if (await Order.exists({ userId: req.params.id})) {
        throw new HttpError (409, "User has orders... Cannot be deleted!");
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new HttpError (404, "User not found!");
    res.status(204).end();
};

// GET api/users/:id/orders     
exports.orders = async (req, res) => {
    res.json(await Order.find({ userId: req.params.id }).sort({ createdAt: -1}));
};

// POST /api/users/:id/contacts       
exports.addContact = async (req, res) => {
    const user = await findUser(req.params.id);
    user.contacts.push(pick(req.body, ["type", "value"]));
    await user.save();
    res.status(201).json(user.contacts);
};

// DELETE /api/users/:id/contacts/:contactId
exports.removeContact = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { $pull: { contacts: { _id: req.params.contactId }}},
        { retrunDocument: "after" }
    );

    if (!user) throw new HttpError(404, "User not found");
    res.json(user.contacts);
}