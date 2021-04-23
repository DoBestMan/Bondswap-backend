pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";
import "./destructor.sol";
import "./operable.sol";
import "./reward_erc20.sol";


interface IStats {
    function stats() external view returns(address[] memory,  uint256[] memory, uint256);
    function clear() external;
}

contract LiquidityMiner is Operable, RewardERC20, Destructor {
    address public liquidityStatsAddr;
    
    constructor(address _rewardToken, uint256 _dayRewardAmount, address _statsAddr, address _operatorAddr) Operable(_operatorAddr) RewardERC20(_rewardToken,_dayRewardAmount) public {
        liquidityStatsAddr = _statsAddr;
    }
    
    function updateStatsAddr(address _addr) onlyOwner public {
        require(_addr!=liquidityStatsAddr, "check stats address");
        require(_addr!=address(0), "check stats address 0");
        liquidityStatsAddr = _addr;
    }
    
    function liquidityMint() onlyOperator onlyBeforeDestruct public{
        // mint
        mint();
        // clear
        IStats(liquidityStatsAddr).clear();
    }
    
    function mintInfo() public view override returns(address[] memory,  uint256[] memory, uint256) {
        return IStats(liquidityStatsAddr).stats();
    }
}

contract StakingMiner is Operable, RewardERC20, Destructor {
    address public stakingStatsAddr;
     
    constructor(address _rewardToken, uint256 _dayRewardAmount, address _statsAddr, address _operatorAddr) Operable(_operatorAddr) RewardERC20(_rewardToken,_dayRewardAmount) public {
        stakingStatsAddr = _statsAddr;
    }
    
    function updateStatsAddr(address _addr) onlyOwner public {
        require(_addr!=stakingStatsAddr, "check stats address");
        require(_addr!=address(0), "check stats address 0");
        stakingStatsAddr = _addr;
    }
    
    
    
    function stakingMint() onlyOperator onlyBeforeDestruct public{
        // mint
        mint();
        // clear
        IStats(stakingStatsAddr).clear();
    }
    
    function mintInfo() public view override returns(address[] memory,  uint256[] memory, uint256) {
        return IStats(stakingStatsAddr).stats();
    }
}

contract Miner is Ownable, Operable {
    address public liquidityMinerAddr;
    address public stakingMinerAddr;
    
    constructor(address _liquidityMinerAddr, address _stakingMinerAddr, address _operator) Operable(_operator) public{
        liquidityMinerAddr = _liquidityMinerAddr;
        stakingMinerAddr = _stakingMinerAddr;
    }
    
    function mint() onlyOperator public {
        StakingMiner(stakingMinerAddr).stakingMint();
        LiquidityMiner(liquidityMinerAddr).liquidityMint();
    }
}



