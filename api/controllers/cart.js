import fs from "fs" ;
export const test =  (req,res) => {  
    res.json ({
        message : 'Api route is working',
    });
}


//req params -> userId, productId, productAmount
export const addToCart = (req, res) => {
    let cartPath = `./DataStorage/cartList.json`
    let productPath = `./DataStorage/productList.json`
    //read the data from the files
    let productList = readJsonFile(productPath);
    let cartList = readJsonFile(cartPath);
    try{
        let cart = null;
        //get product from the Porduct Data by filtering with productId
        let product = productList.find(p => p.productId === req.body.productId)
        //check if product is present and quantity in stock
        if(product && product.inStock>0){
            let userCart = cartList.find(cart => cart.userId==req.body.userId);
            //check if cart already present
            if(userCart){
                let cartProduct = userCart.products.find(product => product.productId==req.body.productId);
                //if product which user adding already present then update quantity only 
                if(cartProduct){
                    cartProduct.quantity += 1;
                }
                //if product not present in cart then add product
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



module.exports = readJsonFile;
module.exports = writeJsonFile;