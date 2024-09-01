import { getDetails } from '../api/controllers/getDetials.js'; // Adjust the path as needed
import { readJsonFile, writeJsonFile } from '../api/controllers/cart.js';

jest.mock('../api/controllers/cart.js');

describe('getDetails', () => {
    let req, res;

    beforeEach(() => {
        req = {}; // No body or params needed for this function
        res = {
            json: jest.fn(), // Mock the res.json method
        };

        // Mock data for orderList
        const mockOrderList = [
            {
                orderId: 1,
                userId: 1,
                orderAmount: 200,
                discountCode: 'DISCOUNT2024',
                discountAmount: 20,
                products: [
                    { productId: 101, quantity: 2 },
                    { productId: 102, quantity: 1 },
                ],
            },
            {
                orderId: 2,
                userId: 2,
                orderAmount: 300,
                discountCode: '',
                discountAmount: 0,
                products: [
                    { productId: 101, quantity: 1 },
                    { productId: 103, quantity: 4 },
                ],
            },
        ];

        readJsonFile.mockImplementation(() => mockOrderList); // Mock the readJsonFile function
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should calculate totalOrderAmount, totalDiscountAmount, productQuantities, and discountCodes', () => {
        getDetails(req, res);

        // Expected output object
        const expectedResponse = {
            totalOrderAmount: 500, // 200 + 300
            totalDiscountAmount: 20, // Only 20 from the first order
            products: [
                { productId: 101, quantity: 3 }, // 2 from first order + 1 from second order
                { productId: 102, quantity: 1 },
                { productId: 103, quantity: 4 },
            ],
            discountCodes: ['DISCOUNT2024'], // Only one discount code
        };

        expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });

    test('should handle empty orderList and return zero totals', () => {
        readJsonFile.mockImplementation(() => []); // Mock with empty orderList

        getDetails(req, res);

        const expectedResponse = {
            totalOrderAmount: 0,
            totalDiscountAmount: 0,
            products: [],
            discountCodes: [],
        };

        expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
});
