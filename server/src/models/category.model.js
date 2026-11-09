import mongoose from 'mongoose'
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required.'
    },
    slug: {
        type: String,
        trim: true,
        required: 'Slug is required.'
    },
    description {
        type: String,
        trim: true,
        required: 'Description is required.'
    },
});
export default mongoose.model('Category', CategorySchema);