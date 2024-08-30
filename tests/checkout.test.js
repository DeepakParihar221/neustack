const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

// Import the function to test
const { checkout } = require('./api/controllers/checkout'); 

// Mock helper functions
const { readJsonFile, writeJsonFile } = require('./api/controllers/cart'); 

describe('Checkout API', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {
                userId: 1
            }
        };
        res = {
            json: sinon.spy()
        };

        // Mock readJsonFile and writeJsonFile functions
        sinon.stub(global, 'readJsonFile').callsFake(() => {
            return [
                {
                    userId: 1,
                    cartAmount: 100,
                    products: ['item1', 'item2']
                }
            ];
        });

        sinon.stub(global, 'writeJsonFile').callsFake(() => {});

        // Mock other dependencies (e.g., saveOrder, generateDiscountCodeMethod)
        sinon.stub(global, 'saveOrder').returns({
            orderId: 123,
            userId: 1,
            discountCode: 'DISCOUNT10',
            totalAmount: 100,
            products: ['item1', 'item2']
        });

        sinon.stub(global, 'generateDiscountCodeMethod').returns('DISCOUNT10');
    });

    afterEach(() => {
        // Restore the original functions
        sinon.restore();
    });

    it('should complete checkout and return the order details', () => {
        checkout(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            orderId: 123,
            userId: 1,
            discountCode: 'DISCOUNT10',
            totalAmount: 100,
            products: ['item1', 'item2']
        });

        // Verify if the cart was removed from the list
        expect(writeJsonFile.calledOnce).to.be.true;
        expect(writeJsonFile.firstCall.args[1]).to.deep.equal([]);
    });

    it('should return a message when no items are in the cart', () => {
        // Modify the mock to return an empty cart list
        readJsonFile.restore();
        sinon.stub(global, 'readJsonFile').callsFake(() => {
            return [];
        });

        checkout(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'No item present in cart' });
    });

    it('should handle errors gracefully', () => {
        // Force an error
        readJsonFile.restore();
        sinon.stub(global, 'readJsonFile').throws(new Error('File read error'));

        checkout(req, res);

        expect(res.json.called).to.be.false; // Error was caught before sending a response
        expect(console.log.calledOnce).to.be.true;
        expect(console.log.firstCall.args[0]).to.equal('File read error');
    });
});
