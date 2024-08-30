import express from 'express';
import { test } from "../controllers/cart.js";
import {addToCart} from "../controllers/cart.js";
import { checkout } from '../controllers/checkout.js';
import { generateDiscountCode } from '../controllers/discount.js';
import { getDetails } from '../controllers/getDetials.js';

const router = express.Router();

router.get('/test', test);  

router.post('/addtocart', addToCart);
router.post('/checkout', checkout);
router.post('/generateDiscountCode', generateDiscountCode);
router.post('/getDetails',getDetails);

export default router ;