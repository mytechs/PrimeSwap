pragma solidity ^0.5.0;

import "./Token.sol";

contract PrimeSwap{
    string public name = "PrimeSwap-DEX";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event Tokenssold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //Redemption rate = # of tokens redeemed for 1 ETH
        //calculate the amount of tokens to be redeemed
        //Amount of Eth * Redemption Rate

        uint tokenAmount = msg.value*rate;

        //Reqiure that PrimeSwap has enough tokens to cover the redemption
        require(token.balanceOf(address(this)) >= tokenAmount );

        //Transfer token to user
        token.transfer(msg.sender, tokenAmount);

        //Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        //User can only sell tokens they own
        require(token.balanceOf(msg.sender) >= _amount);

        // Calculate the amount of ETH to be redeemed
        uint etherAmount =_amount / rate;

        // Require Primeswaphas enough Ether
        require(address(this).balance >= etherAmount);


        //perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);


        //Emit an event
        emit Tokenssold(msg.sender, address(token), _amount, rate);
    }
}

