const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  note: { type: String, default: '' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
