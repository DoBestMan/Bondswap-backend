pragma solidity 0.6.0;

import "./reward.sol";

abstract contract RewardEther is Reward {
    
    function transferTo(address _to, uint256 _amount) internal override {
        // transfer ether
        address(uint160(_to)).transfer(_amount);
    }
}
