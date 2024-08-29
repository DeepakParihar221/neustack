import { log } from 'console';

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


//req params -> userId, productId, productAmount
export const addToCart = (req, res) => {
    let cartList = readJsonFile('../../cartList.json');
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
            cart = {
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

