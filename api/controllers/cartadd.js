const fs = require('fs');

export const test =  (req,res) => {  
    res.json ({
        message : 'Api route is working',
    });
}

// Function to read JSON file
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading the file:", err);
        return null;
    }
}

// Function to write to JSON file
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log('File successfully updated!');
    } catch (err) {
        console.error("Error writing to the file:", err);
    }
}


//function to simulate order counting
function getOrderCount() {
    try{
        // Read the orders data
        const orderList = readJsonFile('../../orders.json');

        // Count the number of orders
        const userOrders = orderList.length;
        if(userOrders.length<=0) return 0;
        return userOrders.length;
    }
    catch(err){
        console.log(err.message);
    }
}

// Function to generate a discount code
//params -> userId
export const generateDiscountCode = (req, res) => {
    try{
        let count = getOrderCount();
        let filePath = $`../../discounts.json`;
        const discountList = readJsonFile(filePath);
        let discountCode = "";
        //assuming n=5, so for every 5th order,user gets discountCode
        if(count%5===0)
        discountCode= uuid.v4().substring(0, 8).toUpperCase(); // Example: 'E5F8A2D4'
        
        let discount = {
            discountId: discountList.length + 101,
            discountCode: discountCode,
            userId: userId
        }
        discountList.push(discount);
        if(discountList){
            writeJsonFile(filePath, discountList);
        }

        return discountList.length + 101;
    }
    catch(err){
        console.log(err.message);
    }
}


//save the order for future reference of the order count
function saveOrder(userId, discountId, orderAmount){
    try{
        let filePath = $`../../orders.json`;
        const orderList = readJsonFile(filePath);
        let discountAmount = 0;
        if(discountId!="" && discountId!=null){
            discountAmount = (orderAmount/10);
        }
        let order = {
            orderId: orderList.length + 101,
            orderAmount,
            userId,
            discountId,
            discountAmount : discountAmount
        }
        orderList.push(order);
        if(orderList)
            writeJsonFile(filePath, orderList);
    }
    catch(err){
        console.log(err.message);
    }
}

//req params -> userId, productId, productAmount
export const addToCart = (req, res) => {
    let filePath = $`../../cartList.json`
    let cartList = readJsonFile(filePath);
    try{
        let userCart = cartList.find(cart => cart.userId==req.userId);
        if(userCart){
            //if cart found adding a new product into the care
            let product = userCart.products.find(product => product.productId==req.productId);
            if(product){
                product.quantity += 1;
            }
            else{
                userCart.products.push({ productId: productId, quantity: 1 });
            }
            userCart.cartAmount += productAmount;
        }
        else{
            //adding a new cart for the userId if cart not found
            let cart = {
                cartId: cartList.length + 101,  // Generating a new cart ID
                userId: userId,
                cartAmount: productAmount,  
                products: [
                    { productId: productId, quantity: 1 }
                ]
            };
            cartList.push(cart);
        }
        if(cartList){
            writeJsonFile(filePath, cartList);
        }
    }
    catch(err){
        console.log(err.message);
    }

}

//params -> userId, 
export const checkout = (req, res) => {
    let filePath = $`../../cartList.json`;
    let cartList = readJsonFile(filePath);
    try {
        let userCartIndex = cartList.findIndex(cart => cart.userId==req.userId);
        if(userCartIndex!=-1){
            const totalAmount = cartList[userCartIndex].cartAmount;
            console.log(`Checkout completed! Total amount: $${totalAmount}`);

            let discountId = generateDiscountCode();

            saveOrder(userId, discountId, totalAmount);
            // Remove the cart from the data array
            cartList.splice(userCartIndex, 1);

            writeJsonFile(filePath, cartList);
        }
        else{
            console.log("No item present in cart");
        }
    } catch (error) {
        console.log(error.message);
        
    }
}

