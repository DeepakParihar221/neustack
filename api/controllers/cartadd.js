import fs from "fs" ;
import { v4 as uuidv4 } from "uuid";
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
        console.error("Error reading the file:", err.message);
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
        let count = getOrderCount();
        let filePath = `./DataStorage/discounts.json`;
        const discountList = readJsonFile(filePath);
        let discountCode = "";
        //assuming n=5, so for every 5th order,user gets discountCode
        if(count%5===0){
            discountCode= uuidv4().substring(0, 8).toUpperCase(); // Example: 'E5F8A2D4'
        }

        
        
        let discount = {
            discountId: discountList.length + 101,
            discountCode: discountCode,
            userId: userId
        }
        discountList.push(discount);
        if(discountList){
            writeJsonFile(filePath, discountList);
        }

        return discountCode;
    }
    catch(err){
        console.log(err.message);
    }
}

// Function to generate a discount code
//params -> userId
export const generateDiscountCode = (req, res) => {
    let discountCode = generateDiscountCodeMethod(req.body.userId);

    res.json({discountCode: discountCode});
}


//save the order for future reference of the order count
function saveOrder(userId, discountCode, orderAmount,products){
    try{
        let filePath = `./DataStorage/orders.json`;
        const orderList = readJsonFile(filePath);
        let discountAmount = 0;
        if(discountCode!="" && discountCode!=null){
            discountAmount = (orderAmount/10);
        }
        let order = {
            orderId: orderList.length + 101,
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

//req params -> userId, productId, productAmount
export const addToCart = (req, res) => {
    let cartPath = `./DataStorage/cartList.json`
    let productPath = `./DataStorage/productList.json`

    let productList = readJsonFile(productPath);
    let cartList = readJsonFile(cartPath);
    try{
        let cart = null;
        let product = productList.find(p => p.productId === req.body.productId)
        if(product && product.inStock>0){
        
            let userCart = cartList.find(cart => cart.userId==req.body.userId);
            if(userCart){
                //if cart found adding a new product into the care
                let cartProduct = userCart.products.find(product => product.productId==req.body.productId);

                if(cartProduct){
                    cartProduct.quantity += 1;
                }
                else{
                    userCart.products.push({ productId: req.body.productId, quantity: 1 });
                }
                product.inStock -= 1;
                userCart.cartAmount += req.body.productAmount;
                cart = userCart;
            }
            else{
                //adding a new cart for the userId if cart not found
                cart = {
                    cartId: cartList.length + 101,  // Generating a new cart ID
                    userId: req.body.userId,
                    cartAmount: req.body.productAmount,  
                    products: [
                        { productId: req.body.productId, quantity: 1 }
                    ]
                };
                product.inStock -= 1;
                cartList.push(cart);
            }
            if(cartList){
                writeJsonFile(cartPath, cartList);
            }
            writeJsonFile(productPath,productList );
        }
        else{
            res.json({message: "The product is out of stock"});
        }
        res.json(cart);
    }
    catch(err){
        console.log(err.message);
        //res.error(err);
    }

}

export const getDetails = (req,res) => {
    let filePath = `./DataStorage/orders.json`;
    let orderList = readJsonFile(filePath);
    
    try{
        //  let product = orderlist.findIndex(order => )
          
        let totalorderamount =0; 
        let  totaldiscountamount = 0; 
        let productQuantities = {};
        let discountCodes = [];
        for(let i=0;i<orderList.length;i++){
             totalorderamount += orderList[i].orderAmount ;
             totaldiscountamount += orderList[i].discountAmount ;
             if(orderList[i].discountCode!="")
             discountCodes.push(orderList[i].discountCode);
             orderList[i].products.forEach(product => {
                // Extract the productId and quantity
                const { productId, quantity } = product;
            
                // Check if the productId already exists in the productQuantities object
                if (productQuantities[productId]) {
                  // If it exists, add the quantity to the existing total
                  productQuantities[productId] += quantity;
                } else {
                  // If it doesn't exist, initialize it with the current quantity
                  productQuantities[productId] = quantity;
                }
              });
        }
        // Convert the productQuantities object to an array of objects
        const productQuantitiesArrayOfObjects = Object.keys(productQuantities).map(productId => ({
            productId: parseInt(productId, 10), // Convert productId back to a number if needed
            quantity: productQuantities[productId]
        }));
        let obj = {

            totalOrderAmount: totalorderamount,
            totalDiscountAmount:totaldiscountamount,
            products: productQuantitiesArrayOfObjects,
            discountCodes: discountCodes
        }
      //console.log(obj);
      res.json(obj);
      
    } catch (error) {
        console.log(error.message);
        
    }
}

//params -> userId, 
export const checkout = (req, res) => {
    let filePath = `./DataStorage/cartList.json`;
    let cartList = readJsonFile(filePath);
    try {
        let userCartIndex = cartList.findIndex(cart => cart.userId==req.body.userId);
        if(userCartIndex!=-1){
            const totalAmount = cartList[userCartIndex].cartAmount;
            console.log(`Checkout completed! Total amount: $${totalAmount}`);

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

