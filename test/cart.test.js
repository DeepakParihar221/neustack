import { addToCart } from '../api/controllers/cart.js'; 
import fs from 'fs';
import path from 'path';

jest.mock('fs');

// Mock implementations for reading and writing files
const readJsonFile = (filePath) => {
    const data = fs.readFileSync(path.resolve(filePath), 'utf8');
    return JSON.parse(data);
};

const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(data, null, 2), 'utf8');
};

// Replace the actual file read/write functions in your module with these mocks
jest.mock('../api/controllers/cart.js', () => ({
    ...jest.requireActual('../api/controllers/cart.js'),
    readJsonFile,
    writeJsonFile,
}));

describe('addToCart', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                userId: 1,
                productId: 101,
                productAmount: 100,
            },
        };

        res = {
            json: jest.fn(),
        };

        // Set up initial mock data
        fs.readFileSync.mockImplementation((filePath) => {
            if (filePath.includes('productList.json')) {
                return JSON.stringify([
                    { productId: 101, inStock: 10 },
                    { productId: 102, inStock: 0 },
                ]);
            }
            if (filePath.includes('cartList.json')) {
                return JSON.stringify([
                    {
                        cartId: 1,
                        userId: 1,
                        cartAmount: 200,
                        products: [{ productId: 101, quantity: 2 }],
                    },
                ]);
            }
            return '';
        });

        fs.writeFileSync.mockImplementation(() => {});  // Mock write to avoid actual file changes
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should add product to existing cart if product is in stock', () => {
        addToCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                cartAmount: 300,
                cartId: 1,
                products: expect.arrayContaining([
                    expect.objectContaining({ productId: 101, quantity: 3 }),
                ]),
                userId: 1,
            })
        );
    });

    test('should return out of stock message if product is not available', () => {
        req.body.productId = 102;  // Product that is out of stock

        addToCart(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'The product is out of stock' });
        expect(fs.writeFileSync).not.toHaveBeenCalled();  // No changes should be made
    });

    test('should create a new cart if no cart exists for user', () => {
        req.body.userId = 2;  // New user with no existing cart

        addToCart(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            cartId: 102,
            userId: 2,
            cartAmount: 100,
            products: expect.arrayContaining([
                expect.objectContaining({ productId: 101, quantity: 1 }),
            ]),
        }));

        expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    });
});
