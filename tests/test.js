import fs from 'fs';
import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

// Stub out fs module for file operations
const fsStub = {
    readFileSync: sinon.stub(),
    writeFileSync: sinon.stub()
};

// Replace the fs module with the stubbed version
const { 
    test, 
    addToCart
} = proxyquire('./api/controllers/cart', { fs: fsStub });

const { 
    checkout
} = proxyquire('./api/controllers/checkout', { fs: fsStub });

const { 
    generateDiscountCode
} = proxyquire('./api/controllers/discount', { fs: fsStub });

const { 
    getDetails 
} = proxyquire('./api/controllers/getDetails', { fs: fsStub });

describe('API Tests', () => {

    describe('test route', () => {
        it('should return a working message', () => {
            const req = {};
            const res = {
                json: sinon.spy()
            };

            test(req, res);
            expect(res.json.calledWith({ message: 'Api route is working' })).to.be.true;
        });
    });

    describe('generateDiscountCode', () => {
        it('should generate a discount code if the order count is a multiple of 5', () => {
            const req = {
                body: { userId: 1 }
            };
            const res = {
                json: sinon.spy()
            };

            // Mock the readJsonFile and getOrderCount functions
            const ordersMock = new Array(4).fill({}); // 4 orders to trigger 5th order
            const discountsMock = [];

            fsStub.readFileSync.withArgs('./DataStorage/orders.json').returns(JSON.stringify(ordersMock));
            fsStub.readFileSync.withArgs('./DataStorage/discounts.json').returns(JSON.stringify(discountsMock));
            fsStub.writeFileSync.reset();

            generateDiscountCode(req, res);
            expect(fsStub.writeFileSync.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0].discountCode).to.have.lengthOf(8);
        });

        it('should not generate a discount code if the order count is not a multiple of 5', () => {
            const req = {
                body: { userId: 1 }
            };
            const res = {
                json: sinon.spy()
            };

            const ordersMock = new Array(3).fill({});
            const discountsMock = [];

            fsStub.readFileSync.withArgs('./DataStorage/orders.json').returns(JSON.stringify(ordersMock));
            fsStub.readFileSync.withArgs('./DataStorage/discounts.json').returns(JSON.stringify(discountsMock));

            generateDiscountCode(req, res);
            expect(res.json.firstCall.args[0].discountCode).to.equal('');
        });
    });

    describe('addToCart', () => {
        it('should add a product to an existing cart and update the product stock', () => {
            const req = {
                body: { userId: 1, productId: 101, productAmount: 100 }
            };
            const res = {
                json: sinon.spy()
            };

            const cartMock = [{
                cartId: 101,
                userId: 1,
                cartAmount: 200,
                products: [{ productId: 102, quantity: 1 }]
            }];
            const productMock = [{ productId: 101, inStock: 10 }];

            fsStub.readFileSync.withArgs('./DataStorage/cartList.json').returns(JSON.stringify(cartMock));
            fsStub.readFileSync.withArgs('./DataStorage/productList.json').returns(JSON.stringify(productMock));

            addToCart(req, res);

            expect(fsStub.writeFileSync.calledTwice).to.be.true;
            expect(res.json.firstCall.args[0].cartAmount).to.equal(300);
        });

        it('should create a new cart if none exists', () => {
            const req = {
                body: { userId: 2, productId: 101, productAmount: 100 }
            };
            const res = {
                json: sinon.spy()
            };

            const cartMock = [];
            const productMock = [{ productId: 101, inStock: 10 }];

            fsStub.readFileSync.withArgs('./DataStorage/cartList.json').returns(JSON.stringify(cartMock));
            fsStub.readFileSync.withArgs('./DataStorage/productList.json').returns(JSON.stringify(productMock));

            addToCart(req, res);

            expect(fsStub.writeFileSync.calledTwice).to.be.true;
            expect(res.json.firstCall.args[0].userId).to.equal(2);
        });

        it('should return an out of stock message if the product is not available', () => {
            const req = {
                body: { userId: 1, productId: 101, productAmount: 100 }
            };
            const res = {
                json: sinon.spy()
            };

            const productMock = [{ productId: 101, inStock: 0 }];

            fsStub.readFileSync.withArgs('./DataStorage/productList.json').returns(JSON.stringify(productMock));

            addToCart(req, res);

            expect(res.json.calledWith({ message: "The product is out of stock" })).to.be.true;
        });
    });

    describe('checkout', () => {
        it('should remove the cart after checkout and save the order', () => {
            const req = {
                body: { userId: 1 }
            };
            const res = {
                json: sinon.spy()
            };

            const cartMock = [{
                cartId: 101,
                userId: 1,
                cartAmount: 200,
                products: [{ productId: 101, quantity: 1 }]
            }];

            const ordersMock = [];
            fsStub.readFileSync.withArgs('./DataStorage/cartList.json').returns(JSON.stringify(cartMock));
            fsStub.readFileSync.withArgs('./DataStorage/orders.json').returns(JSON.stringify(ordersMock));

            checkout(req, res);

            expect(fsStub.writeFileSync.calledTwice).to.be.true;
            expect(res.json.firstCall.args[0].cartAmount).to.equal(200);
            expect(fsStub.writeFileSync.secondCall.args[1]).to.not.include(cartMock[0]);
        });

        it('should return a message if no items are in the cart', () => {
            const req = {
                body: { userId: 1 }
            };
            const res = {
                json: sinon.spy()
            };

            const cartMock = [];

            fsStub.readFileSync.withArgs('./DataStorage/cartList.json').returns(JSON.stringify(cartMock));

            checkout(req, res);

            expect(res.json.calledWith({ message: "No item present in cart" })).to.be.true;
        });
    });

    describe('getDetails', () => {
        it('should return order details including total amounts, product quantities, and discount codes', () => {
            const req = {};
            const res = {
                json: sinon.spy()
            };

            const ordersMock = [{
                orderId: 101,
                orderAmount: 200,
                userId: 1,
                discountCode: 'DISCOUNT10',
                discountAmount: 20,
                products: [{ productId: 101, quantity: 2 }]
            }];

            fsStub.readFileSync.withArgs('./DataStorage/orders.json').returns(JSON.stringify(ordersMock));

            getDetails(req, res);

            const response = res.json.firstCall.args[0];
            expect(response.totalOrderAmount).to.equal(200);
            expect(response.totalDiscountAmount).to.equal(20);
            expect(response.products[0].quantity).to.equal(2);
            expect(response.discountCodes).to.include('DISCOUNT10');
        });
    });
});
