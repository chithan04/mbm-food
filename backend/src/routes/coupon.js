const express = require("express");

const {
  createCoupon,
  getCoupons,
  updateCoupon,
  getCouponById,
  deleteCoupon,
} = require('../controllers/couponController');

const router = express.Router();

router.post('/', createCoupon);

router.get('/', getCoupons);

router.get('/:id', getCouponById);

router.put('/:id', updateCoupon);

router.delete('/:id', deleteCoupon);

module.exports = router;