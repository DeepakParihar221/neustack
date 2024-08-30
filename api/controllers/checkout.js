import {readJsonFile, writeJsonFile} from './cart'
import {generateDiscountCodeMethod} from './discount'

//params -> userId, 
export const checkout = (req, res) => {
    let filePath = `./DataStorage/cartList.json`;
    let cartList = readJsonFile(filePath);
    try {
        let userCartIndex = cartList.findIndex(cart => cart.userId==req.body.userId);
        if(userCartIndex!=-1){
            const totalAmount = cartList[userCartIndex].cartAmount;
            console.log(`Checkout completed! Total amount: $${totalAmount}`);
            //generate the discountCode if order is eligible
            let discountCode = generateDiscountCodeMethod(req.body.userId);

            saveOrder(req.body.userId, discountCode, totalAmount, cartList[userCartIndex].products);
            // Remove the cart from the data array
            let response = cartList[userCartIndex];
            cartList.splice(userCartIndex, 1);
            writeJsonFile(filePath, cartList);
            res.json(response);
        }
        else{
            res.json({message: "No item present in cart"})
        }
    } catch (error) {
        console.log(error.message);
        
    }
}


//save the order for future reference for getting the total purchased details
function saveOrder(userId, discountCode, orderAmount,products){
    try{
        let filePath = `./DataStorage/orders.json`;
        const orderList = readJsonFile(filePath);
        let discountAmount = 0;
        //If discountCOde is not empty then generate discountAmount which is 10% of Ordered amount
        if(discountCode!="" && discountCode!=null){
            discountAmount = (orderAmount/10);
        }
        let order = {
            orderId: orderList.length + 101, //generating the orderID
            orderAmount,
            userId,
            discountCode,
            discountAmount : discountAmount,
            products: products
            
        }
        orderList.push(order);
        if(orderList)
            writeJsonFile(filePath, orderList);
    }
    catch(err){
        console.log(err.message);
    }
}