import {readJsonFile, writeJsonFile} from './cart';
import { v4 as uuidv4 } from "uuid";


//params -> userId
export const generateDiscountCode = (req, res) => {
    let discountCode = generateDiscountCodeMethod(req.body.userId);

    res.json({discountCode: discountCode});
}


//function to simulate order counting
function getOrderCount() {
    try{
        // Read the orders data
        const orderList = readJsonFile('./DataStorage/orders.json');

        // Count the number of orders
        const userOrders = orderList.length;
        if(userOrders<=0) return 0;
        return userOrders+1;
    }
    catch(err){
        console.log(err.message);
    }
}

function generateDiscountCodeMethod(userId){
    try{
        //Count the number of current order to check if order is eligible for discount
        let count = getOrderCount();
        let filePath = `./DataStorage/discounts.json`;
        const discountList = readJsonFile(filePath);
        let discountCode = "";
        //assuming n=5, so for every 5th order,user gets discountCode
        if(count%5===0){
            discountCode= uuidv4().substring(0, 8).toUpperCase(); // Example: 'E5F8A2D4'
        }
        //if discountCode generated then add it to the DB
        if(discountCode!=""){
            let discount = {
                discountId: discountList.length + 101,
                discountCode: discountCode,
                userId: userId
            }
            discountList.push(discount);
            writeJsonFile(filePath, discountList);
        }
        return discountCode;
    }
    catch(err){
        console.log(err.message);
    }
}