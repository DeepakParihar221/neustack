import express from 'express';
import { test } from "../controllers/cart.js";
import {addToCart} from "../controllers/cart.js";
import { checkout } from '../controllers/checkout.js';
import { generateDiscountCode } from '../controllers/discount.js';
import { getDetails } from '../controllers/getDetials.js';

const router = express.Router();

router.get('/test', test);  

//req params -> userId, productId, productAmount
router.post('/addtocart', addToCart);

//params -> userId 
router.post('/checkout', checkout);

//params -> userId
router.post('/generateDiscountCode', generateDiscountCode);

router.get('/getDetails',getDetails);

export default router ;