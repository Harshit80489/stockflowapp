const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { supplier: { $regex: search, $options: 'i' } }
    ];
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name color')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: products, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    await product.populate('category', 'name color');
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const oldQty = product.quantity;
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name color');

    if (req.body.quantity !== undefined && Number(req.body.quantity) !== oldQty) {
      const diff = Number(req.body.quantity) - oldQty;
      await StockHistory.create({
        product: product._id, type: diff > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(diff), previousQuantity: oldQty,
        newQuantity: Number(req.body.quantity), note: 'Product edit',
        performedBy: req.user._id
      });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await StockHistory.deleteMany({ product: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    const rows = [['Name', 'SKU', 'Category', 'Quantity', 'Price', 'Supplier', 'Date Added']];
    products.forEach(p => rows.push([p.name, p.sku, p.category?.name || '', p.quantity, p.price, p.supplier, new Date(p.createdAt).toLocaleDateString()]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
