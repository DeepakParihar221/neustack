import express from 'express';
import { test } from "../controllers/cartadd.js";
import {addToCart, checkout, generateDiscountCode} from "../controllers/cartadd.js";

const router = express.Router();

router.get('/test', test);  

router.post('/addtocart', addToCart);


export default router ;