import express from 'express';
import { test } from "../controllers/cartadd.js";
import {addToCart, checkout, generateDiscountCode,getDetails} from "../controllers/cartadd.js";

const router = express.Router();

router.get('/test', test);  

router.post('/addtocart', addToCart);
router.post('/checkout', checkout);
router.post('/generateDiscountCode', generateDiscountCode);
router.post('/getDetails',getDetails);

export default router ;