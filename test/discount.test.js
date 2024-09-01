import { generateDiscountCode, generateDiscountCodeMethod } from '../api/controllers/discount.js'; 
import { readJsonFile, writeJsonFile } from '../api/controllers/cart.js';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../api/controllers/cart.js');
jest.mock('uuid');

describe('generateDiscountCode', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: 1,
            },
        };
        res = {
            json: jest.fn(), // Mock the res.json method
        };
        uuidv4.mockReturnValue('e5f8a2d4-e5f8a2d4-e5f8a2d4'); // Mock the UUID generation
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should generate a discount code for every 5th order', () => {
        // Mock the order count to be 5 (i.e., count % 5 === 0)
        readJsonFile.mockImplementation((filePath) => {
            if (filePath.includes('orders.json')) {
                return new Array(4); // Simulate 5 orders
            } else if (filePath.includes('discounts.json')) {
                return []; // No previous discounts
            }
        });
        
        generateDiscountCode(req, res);
        

        // Verify that the discount code was generated and saved
        expect(uuidv4).toHaveBeenCalled();
        expect(writeJsonFile).toHaveBeenCalledWith(
            expect.stringContaining('discounts.json'),
            expect.arrayContaining([
                expect.objectContaining({
                    discountCode: 'E5F8A2D4', // Uppercased UUID substring
                    userId: 1,
                }),
            ])
        );
        expect(res.json).toHaveBeenCalledWith({ discountCode: 'E5F8A2D4' });
    });

    test('should not generate a discount code if not every 5th order', () => {
        // Mock the order count to be 4 (i.e., count % 5 !== 0)
        readJsonFile.mockImplementation((filePath) => {
            if (filePath.includes('orders.json')) {
                return new Array(7); // Simulate 7 orders
            } else if (filePath.includes('discounts.json')) {
                return []; // No previous discounts
            }
        });

        generateDiscountCode(req, res);

        // Verify that no discount code was generated or saved
        expect(uuidv4).not.toHaveBeenCalled();
        expect(writeJsonFile).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ discountCode: '' });
    });

    test('should handle errors gracefully in generateDiscountCodeMethod', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        readJsonFile.mockImplementation(() => {
            throw new Error('Test Error');
        });
        const discountCode = generateDiscountCodeMethod(1);
        
        expect(discountCode).toBe(''); // Ensure the function returns an empty string on error
        expect(consoleSpy).toHaveBeenCalledWith('Test Error');

        consoleSpy.mockRestore();
    });
});
