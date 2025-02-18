const mongoose = require("mongoose");
const generateSlug = require("../middleware/slug");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

categorySchema.pre("save", generateSlug);


module.exports = mongoose.model("category", categorySchema);
