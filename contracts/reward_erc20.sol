pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";

import "./reward.sol";

abstract contract RewardERC20 is Reward {
    uint256 private dayRewardAmount;
    address public rewardToken;
    
    constructor(address _rewardToken, uint256 _dayRewardAmount) public {
        dayRewardAmount = _dayRewardAmount;
        rewardToken = _rewardToken;
    }
    
    function updateRewardAmount(uint256 _amount) onlyOwner public {
        dayRewardAmount = _amount;
    }
    
    function getRewardAmount() public view override returns (uint256) {
        return dayRewardAmount;
    }
    
    
    function transferTo(address _to, uint256 _amount) internal override {
        // transfer erc20 token
        IERC20(rewardToken).transfer(_to, _amount);
    }
}
