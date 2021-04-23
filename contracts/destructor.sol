pragma solidity 0.6.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";

abstract contract Destructor is Ownable {
    bool public destructing;
    
    modifier onlyBeforeDestruct() {
        require(!destructing, "pre destory...");
        _;
    }
    
    modifier onlyDestructing() {
        require(destructing, "destorying...");
        _;
    }
    
    function preDestruct() onlyOwner onlyBeforeDestruct public  {
        destructing = true;
    }
    
    function destructERC20(address _erc20, uint256 _amount) onlyOwner onlyDestructing public{
        if(_amount==0){
            _amount = IERC20(_erc20).balanceOf(address(this));    
        }
        require(_amount>0, "check balance");
        IERC20(_erc20).transfer(owner(), _amount);
    }
    
    function destory() onlyOwner onlyDestructing public{
        selfdestruct(address(uint160(owner())));
    }
}
