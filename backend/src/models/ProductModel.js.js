const mongoose = require("mongoose");
const generateSlug = require("../middleware/slug");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    idcate: { type: ObjectId, ref: "category" },
    // description: [
    //   {
    //     summary: { type: String },
    //     title: { type: String },
    //     content: { type: String },
    //     image: { type: String },
    //   },
    // ],
    description: { type: String },
    variants: [
      {
        option: { type: String },
        price: { type: Number, required: true },
        sale_price: { type: Number, default: 0 },
        image: { type: String, required: true }
      },
    ],
    hot: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "unactive"], default: "active" }
  },

  { timestamps: true }
);

productSchema.pre("save", generateSlug);

module.exports = mongoose.model("product", productSchema);
