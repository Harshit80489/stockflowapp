const Product = require('../models/Product');
const Category = require('../models/Category');
const StockHistory = require('../models/StockHistory');

exports.getStats = async (req, res) => {
  try {
    const [totalProducts, totalCategories, lowStockProducts] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] } })
    ]);

    const valueResult = await Product.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }]);
    const totalStockValue = valueResult[0]?.total || 0;

    const recentActivity = await StockHistory.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort('-createdAt').limit(8);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stockMovements = await StockHistory.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' }, total: { $sum: '$quantity' } } },
      { $sort: { '_id.date': 1 } }
    ]);

    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, color: { $ifNull: ['$category.color', '#6366f1'] }, count: 1 } }
    ]);

    res.json({ success: true, data: { stats: { totalProducts, totalCategories, lowStockProducts, totalStockValue }, recentActivity, stockMovements, productsByCategory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
