const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  supplier: { type: String, default: '' },
  lowStockThreshold: { type: Number, default: 10 },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
