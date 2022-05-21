const Token = artifacts.require("Token");
const PrimeSwap = artifacts.require("PrimeSwap");

module.exports = async function(deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  // Deploy PrimeSwap
  await deployer.deploy(PrimeSwap, token.address);
  const primeSwap = await PrimeSwap.deployed()

  // Transfer all tokens to PrimeSwap
  await token.transfer(primeSwap.address, '1000000000000000000000000')
};
