// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyCurrency{

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;

    address owner;
    uint256 public totalSupply;
    string public name;
    string public symbol;

    constructor(string memory name_, string memory symbol_){
        name = name_;
        symbol = symbol_;
        owner= msg.sender;
    }

    function transfer(address recipient, uint amount) public returns (bool) {
        require(balanceOf[msg.sender] > amount,"balance not enough");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
    address from,
    address to,
    uint amount
    ) public returns (bool) {
        require(allowance[from][msg.sender] > amount,"approve amount not enough");
        require(balanceOf[from] > amount,"balance amount not enough");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(uint amount) external {
        require(msg.sender == owner,"permission denied");
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }
}