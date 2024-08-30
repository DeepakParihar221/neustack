const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const fs = require('fs');
const { addToCart } = require('../path_to_your_file'); // Adjust the path

// Helper functions (we need to stub these)
const { readJsonFile, writeJsonFile } = require('../path_to_your_file'); // Adjust the path

describe('addToCart function', () => {
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {}
        };
        res = {
            json: sinon.spy()
        };

         // Mock readJsonFile and writeJsonFile functions
         sinon.stub(global, 'readJsonFile');
         sinon.stub(global, 'writeJsonFile').callsFake(() => {});
    });

    afterEach(() => {
        // Restore the original functions
        sinon.restore();
    });

    it('should add a product to an existing cart', () => {
        // Mock the data returned by readJsonFile
        readJsonFile.returns(JSON.stringify([
            { productId: 1, inStock: 10 },
            { productId: 2, inStock: 5 }
        ]));

        readJsonFile.returns(JSON.stringify([
            {
                cartId: 101,
                userId: 1,
                cartAmount: 100,
                products: [
                    { productId: 1, quantity: 1 }
                ]
            }
        ]));

        req.body = {
            userId: 1,
            productId: 1,
            productAmount: 50
        };

        addToCart(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            cartId: 101,
            userId: 1,
            cartAmount: 150,
            products: [
                { productId: 1, quantity: 2 }
            ]
        });

        expect(writeJsonFile.calledTwice).to.be.true;
    });

    it('should create a new cart when no cart exists for the user', () => {
        // Mock the data returned by readJsonFile
        readJsonFile.returns(JSON.stringify([
            { productId: 1, inStock: 10 }
        ]));

        readJsonFile.returns(JSON.stringify([]));

        req.body = {
            userId: 2,
            productId: 1,
            productAmount: 50
        };

        addToCart(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            cartId: 102,
            userId: 2,
            cartAmount: 50,
            products: [
                { productId: 1, quantity: 1 }
            ]
        });

        expect(writeJsonFile.calledTwice).to.be.true;
    });

    it('should return a message if the product is out of stock', () => {
        // Mock the data returned by readJsonFile
        readJsonFile.returns(JSON.stringify([
            { productId: 1, inStock: 0 }
        ]));

        req.body = {
            userId: 1,
            productId: 1,
            productAmount: 50
        };

        addToCart(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            message: 'The product is out of stock'
        });

        expect(writeJsonFile.called).to.be.false;
    });

    it('should handle errors gracefully', () => {
        // Simulate an error
        readJsonFile.restore();
        sinon.stub(global, 'readJsonFile').throws(new Error('File read error'));

        addToCart(req, res);

        expect(res.json.called).to.be.false; // Should not call res.json when an error occurs
        expect(console.log.calledOnce).to.be.true;
        expect(console.log.firstCall.args[0]).to.equal('File read error');
    });
});
