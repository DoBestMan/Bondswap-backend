pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";

abstract contract Operable is Ownable {
    address public operator;
    
    event OperatorUpdated(address indexed previous, address indexed newOperator);
    constructor(address _operator) public {
        if(_operator==address(0)){
            operator = msg.sender;
        }else{
            operator = _operator;    
        }
        
    }
    
    modifier onlyOperator() {
        require(operator == msg.sender, "Operable: caller is not the operator");
        _;
    }
    
    function updateOperator(address newOperator) public  onlyOwner {
        require(newOperator != address(0), "Operable: new operator is the zero address");
        emit OperatorUpdated(operator, newOperator);
        operator = newOperator;
    }
}

