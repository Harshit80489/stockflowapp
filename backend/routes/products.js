const router = require('express').Router();
const { getProducts, createProduct, updateProduct, deleteProduct, exportCSV } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/export/csv', exportCSV);
router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', adminOnly, deleteProduct);

module.exports = router;
