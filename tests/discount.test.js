const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const { v4: uuidv4 } = require('uuid');

// Import the functions to test
const { generateDiscountCode, __get__ } = require('./api/controllers/discount'); 

// Helper functions
const { readJsonFile, writeJsonFile } = require('./api/controllers/cart'); 

describe('Generate Discount Code API', () => {
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
        sinon.stub(global, 'readJsonFile');
        sinon.stub(global, 'writeJsonFile').callsFake(() => {});

        // Mock uuid generation
        sinon.stub(uuidv4, 'callsFake').returns('E5F8A2D4-1234-5678-9101-ABCD1234');
    });

    afterEach(() => {
        // Restore the original functions
        sinon.restore();
    });

    it('should generate a discount code when the order count is a multiple of 5', () => {
        readJsonFile.onFirstCall().returns([]); // orders.json returns an empty list
        readJsonFile.onSecondCall().returns([]); // discounts.json returns an empty list

        generateDiscountCode(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            discountCode: 'E5F8A2D4'
        });

        expect(writeJsonFile.calledOnce).to.be.true;
    });

    it('should not generate a discount code if the order count is not a multiple of 5', () => {
        readJsonFile.onFirstCall().returns([{}, {}, {}, {}]); // 4 orders in orders.json
        readJsonFile.onSecondCall().returns([]); // discounts.json returns an empty list

        generateDiscountCode(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            discountCode: ''
        });

        expect(writeJsonFile.called).to.be.false;
    });

    it('should return an empty string if there are no orders', () => {
        readJsonFile.onFirstCall().returns([]); // orders.json returns an empty list

        const getOrderCount = __get__('getOrderCount'); // Retrieve the private function
        const count = getOrderCount();

        expect(count).to.equal(0);
    });

    it('should handle errors gracefully in getOrderCount', () => {
        readJsonFile.onFirstCall().throws(new Error('File read error'));

        const getOrderCount = __get__('getOrderCount'); // Retrieve the private function

        const count = getOrderCount();

        expect(count).to.be.undefined; // Should be undefined since error was caught
        expect(console.log.calledOnce).to.be.true;
        expect(console.log.firstCall.args[0]).to.equal('File read error');
    });

    it('should handle errors gracefully in generateDiscountCodeMethod', () => {
        readJsonFile.onFirstCall().throws(new Error('File read error'));

        const generateDiscountCodeMethod = __get__('generateDiscountCodeMethod'); // Retrieve the private function

        const discountCode = generateDiscountCodeMethod(req.body.userId);

        expect(discountCode).to.equal(''); // Should return an empty string since error was caught
        expect(console.log.calledOnce).to.be.true;
        expect(console.log.firstCall.args[0]).to.equal('File read error');
    });
});
