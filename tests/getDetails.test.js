const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

// Import the function to test
const { getDetails } = require('./api/controllers/getDetails'); 

// Helper function mock
const { readJsonFile } = require('./api/controllers/cart'); 

describe('Get Details API', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {};
        res = {
            json: sinon.spy()
        };

        // Mock readJsonFile function
        sinon.stub(global, 'readJsonFile');
    });

    afterEach(() => {
        // Restore the original functions
        sinon.restore();
    });

    it('should return correct order details with discounts and product quantities', () => {
        // Mock the data returned by readJsonFile
        readJsonFile.returns([
            {
                orderAmount: 100,
                discountAmount: 10,
                discountCode: 'DISCOUNT10',
                products: [
                    { productId: 1, quantity: 2 },
                    { productId: 2, quantity: 3 }
                ]
            },
            {
                orderAmount: 200,
                discountAmount: 20,
                discountCode: '',
                products: [
                    { productId: 1, quantity: 1 },
                    { productId: 3, quantity: 4 }
                ]
            }
        ]);

        getDetails(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            totalOrderAmount: 300, // 100 + 200
            totalDiscountAmount: 30, // 10 + 20
            products: [
                { productId: 1, quantity: 3 }, // 2 + 1
                { productId: 2, quantity: 3 },
                { productId: 3, quantity: 4 }
            ],
            discountCodes: ['DISCOUNT10']
        });
    });

    it('should handle orders with no discounts and products correctly', () => {
        readJsonFile.returns([
            {
                orderAmount: 150,
                discountAmount: 0,
                discountCode: '',
                products: [
                    { productId: 4, quantity: 1 },
                    { productId: 5, quantity: 2 }
                ]
            }
        ]);

        getDetails(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            totalOrderAmount: 150,
            totalDiscountAmount: 0,
            products: [
                { productId: 4, quantity: 1 },
                { productId: 5, quantity: 2 }
            ],
            discountCodes: []
        });
    });

    it('should handle an empty order list', () => {
        readJsonFile.returns([]);

        getDetails(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            totalOrderAmount: 0,
            totalDiscountAmount: 0,
            products: [],
            discountCodes: []
        });
    });

    it('should handle errors gracefully', () => {
        readJsonFile.throws(new Error('File read error'));

        getDetails(req, res);

        expect(res.json.called).to.be.false; // Should not call res.json when an error occurs
        expect(console.log.calledOnce).to.be.true;
        expect(console.log.firstCall.args[0]).to.equal('File read error');
    });
});
