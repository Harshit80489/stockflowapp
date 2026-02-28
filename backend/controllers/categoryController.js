const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('-createdAt');
    const withCount = await Promise.all(categories.map(async cat => {
      const count = await Product.countDocuments({ category: cat._id });
      return { ...cat.toJSON(), productCount: count };
    }));
    res.json({ success: true, data: withCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const category = await Category.create({ name, description, color, createdBy: req.user._id });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const inUse = await Product.findOne({ category: req.params.id });
    if (inUse) return res.status(400).json({ success: false, message: 'Cannot delete: category has products' });
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
