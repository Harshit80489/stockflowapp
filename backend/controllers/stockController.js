const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

exports.updateStock = async (req, res) => {
  try {
    const { type, quantity, note } = req.body;
    if (!type || !['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be IN, OUT, or ADJUSTMENT' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prevQty = product.quantity;
    let newQty = prevQty;

    if (type === 'IN') newQty = prevQty + Number(quantity);
    else if (type === 'OUT') {
      if (Number(quantity) > prevQty) return res.status(400).json({ success: false, message: 'Not enough stock' });
      newQty = prevQty - Number(quantity);
    } else {
      newQty = Number(quantity);
    }

    product.quantity = newQty;
    await product.save();

    const history = await StockHistory.create({
      product: product._id, type, quantity: Number(quantity),
      previousQuantity: prevQty, newQuantity: newQty,
      note: note || '', performedBy: req.user._id
    });

    res.json({ success: true, data: { product, history } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 15, productId } = req.query;
    const query = productId ? { product: productId } : {};
    const total = await StockHistory.countDocuments(query);
    const history = await StockHistory.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: history, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } })
      .populate('category', 'name color').sort('quantity');
    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
