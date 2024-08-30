import {readJsonFile, writeJsonFile} from './cart';

export const getDetails = (req,res) => {
    let filePath = `./DataStorage/orders.json`;
    let orderList = readJsonFile(filePath);
    
    try{
        let totalOrderAmount =0; 
        let  totalDiscountAmount = 0; 
        let productQuantities = {};
        let discountCodes = [];
        //Loop through all the orders present in DB and get the detials
        for(let i=0;i<orderList.length;i++){
             totalOrderAmount += orderList[i].orderAmount ;
             totalDiscountAmount += orderList[i].discountAmount ;
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

            totalOrderAmount: totalOrderAmount,
            totalDiscountAmount:totalDiscountAmount,
            products: productQuantitiesArrayOfObjects,
            discountCodes: discountCodes
        }
      res.json(obj);
      
    } catch (error) {
        console.log(error.message);
        
    }
}