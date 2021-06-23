const Marketplace = artifacts.require('./Marketplace.sol')
require('chai').use(require('chai-as-promised')).should()
contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace
    before(async () => {
        marketplace = await Marketplace.deployed()
    })
    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it('has a name', async () => {
            const name = await marketplace.name()
            assert.equal(name, 'Shoe MarketPlace')
        })
    })
    describe('shoes', async () => {
        let result, shoeCount
        before(async () => {
            result = await marketplace.createProduct('nike airforce1', web3.utils.toWei('1', 'Ether'), { from: seller })
            shoeCount = await marketplace.shoeCount()
        })

        it('creates products', async () => {
            //success
            assert.equal(shoeCount, 1)
            // console.log(result.logs)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), shoeCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'nike airforce1', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'owner is correct')
            assert.equal(event.purchased, false, 'purchased is correct')

            //fail
            await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
            await marketplace.createProduct('nike airforce1', 0, { from: seller }).should.be.rejected;
        })
        it('lists products', async () => {
            const shoe = await marketplace.shoes(shoeCount)
            assert.equal(shoe.id.toNumber(), shoeCount.toNumber(), 'id is correct')
            assert.equal(shoe.name, 'nike airforce1', 'name is correct')
            assert.equal(shoe.price, '1000000000000000000', 'price is correct')
            assert.equal(shoe.owner, seller, 'owner is correct')
            assert.equal(shoe.purchased, false, 'purchased is correct')
        })
        it('sells products', async () => {
            //teack seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)
            //success
            //check logs
            result = await marketplace.purchaseProduct(shoeCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') })
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), shoeCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'nike airforce1', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'owner is correct')
            assert.equal(event.purchased, true, 'purchased is correct')
            //check seller received funds 
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)
            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)
            // console.log(oldSellerBalance, newSellerBalance, price)
            const expect = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(), expect.toString())
            //fail invalid id
            await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
            await marketplace.purchaseProduct(shoeCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected
            await marketplace.purchaseProduct(shoeCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
            await marketplace.purchaseProduct(shoeCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
        })

    })
})