import { checkout } from '../api/controllers/checkout.js'; // Adjust the path as needed
import { readJsonFile, writeJsonFile } from '../api/controllers/cart.js';
import { generateDiscountCodeMethod } from '../api/controllers/discount.js';

jest.mock('../api/controllers/cart.js');
jest.mock('../api/controllers/discount.js');

describe('checkout', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: 1,
            },
        };

        res = {
            json: jest.fn(),
        };

        // Mock data for cartList and orders
        const mockCartList = [
            {
                cartId: 1,
                userId: 1,
                cartAmount: 200,
                products: [{ productId: 101, quantity: 2 }],
            },
        ];

        const mockOrderList = [];

        readJsonFile.mockImplementation((filePath) => {
            if (filePath.includes('cartList.json')) {
                return mockCartList;
            }
            if (filePath.includes('orders.json')) {
                return mockOrderList;
            }
            return [];
        });

        writeJsonFile.mockImplementation(() => {});  // Mock write to avoid actual file changes

        generateDiscountCodeMethod.mockReturnValue('DISCOUNT2024');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should complete checkout and save the order', () => {
        checkout(req, res);
    
        expect(generateDiscountCodeMethod).toHaveBeenCalledWith(1);
    
        // Check that the order was saved with the correct details
        const expectedOrder = [
            {
                orderId: 101,  // First order, starting from 101
                userId: 1,
                orderAmount: 200,
                discountCode: 'DISCOUNT2024',
                discountAmount: 20, // 10% of 200
                products: [{ productId: 101, quantity: 2 }],
            },
        ];
    
        expect(writeJsonFile).toHaveBeenNthCalledWith(
            1,  // First call should be to save the order
            expect.stringContaining('orders.json'),
            expect.arrayContaining([expect.objectContaining(expectedOrder[0])])
        );
    
        // Expect the cart list to be updated without the checked-out cart
        expect(writeJsonFile).toHaveBeenNthCalledWith(
            2,  // Second call should be to update the cart list
            expect.stringContaining('cartList.json'),
            expect.arrayContaining([])  // The cart list should be empty after removing the user's cart
        );
    
        // Expect the response to be the saved order
        expect(res.json).toHaveBeenCalledWith(expectedOrder[0]);
    });
    


    test('should return a message if no items are in the cart', () => {
        req.body.userId = 2;  // User with no items in the cart

        checkout(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'No item present in cart' });
        expect(writeJsonFile).not.toHaveBeenCalled();  // No write operations should occur
    });
});
