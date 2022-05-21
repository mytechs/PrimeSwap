const { assert } = require('chai');

const Token = artifacts.require("Token");
const PrimeSwap = artifacts.require("PrimeSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}

contract ('PrimeSwap', ([deployer, investor]) => {
    let token, primeSwap;

    before(async () => {
        token = await Token.new()
        primeSwap = await PrimeSwap.new(token.address)
          // Transfer all tokens to PrimeSwap (1 million)
        await token.transfer(primeSwap.address, tokens('1000000'))

    })
    describe('Token deployment', async() => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'PRIME Token')
        })
    })

    describe('PrimeSwap deployment', async() => {
        it('contract has a name', async () => {
            const name = await primeSwap.name()
            assert.equal(name, 'PrimeSwap-DEX')
        })

        it('contract has tokens', async () => {
            let balance = await token.balanceOf(primeSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async() => {
        let result;
        before(async () => {
            //purchase tokens before each test
            result = await primeSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        it('Allows user to instantly purchase tokens from primeSwap for a fixed price', async () => {
            //check investor balance
            let investorBlance = await token.balanceOf(investor)
            assert.equal(investorBlance.toString(), tokens('100'))

            //check primeSwap balance after purchase
            let primeSwapBlance
            primeSwapBlance = await token.balanceOf(primeSwap.address)
            assert.equal(primeSwapBlance.toString(), tokens('999900'))
            primeSwapBlance = await web3.eth.getBalance(primeSwap.address)
            assert.equal(primeSwapBlance.toString(), web3.utils.toWei('1', 'Ether'))

            //Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })


    describe('sellToken()', async() => {
        let result;
        before(async () => {
            //investor must approve before selling it
            await token.approve(primeSwap.address, tokens('100'), {from: investor})
            //invester sellls the tokens
            result = await primeSwap.sellTokens(tokens('100'), {from: investor})
           
        })
        it('Allows user to instantly sell tokens to primeSwap for a fixed price', async () => {
            //check investor balance
            let investorBlance = await token.balanceOf(investor)
            assert.equal(investorBlance.toString(), tokens('0'))

            //check primeSwap balance after purchase
            let primeSwapBlance
            primeSwapBlance = await token.balanceOf(primeSwap.address)
            assert.equal(primeSwapBlance.toString(), tokens('1000000'))
            primeSwapBlance = await web3.eth.getBalance(primeSwap.address)
            assert.equal(primeSwapBlance.toString(), web3.utils.toWei('0', 'Ether'))
            
            //Check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //FAlLURE : investor cannot sell more than he has
            await primeSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
            
        })
    })
})