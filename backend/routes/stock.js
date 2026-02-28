const router = require('express').Router();
const { updateStock, getHistory, getAlerts } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/history', getHistory);
router.get('/alerts', getAlerts);
router.post('/:id/update', updateStock);

module.exports = router;
