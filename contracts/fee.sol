pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";

import "./reward_ether.sol";
import "./operable.sol";
import "./destructor.sol";

interface IFee {
    function emitFee(address _addr, uint256 _ethVal) payable external;
}

contract FeeStats {
    event Fee(address _addr, uint256 _ethVal);
    function emitFee(address _addr, uint256 _ethVal) payable public {
        require(_ethVal==msg.value, "fee value");
        emit Fee(_addr, _ethVal);
    }
}

// contract FeeMiner is Operable, RewardEther, Destructor {
//     using SafeMath for uint256;
    
//     mapping(address=>uint8) public factoryOwnerMap;
//     address public clearOwner;
    
//     uint256 feeValue;
//     uint256 feeTotal;
    
//     uint256 rewardValue;
//     uint256 buybackValue;
    
//     address public stakingStatsAddr;
    
    
//     constructor(address[] memory _factorys, address _stakingStatsAddr) public {
//         uint _arrLength = _factorys.length;
//         for (uint i=0; i< _arrLength; i++) {
//             factoryOwnerMap[_factorys[i]] = 1;
//         }
//         stakingStatsAddr = _stakingStatsAddr;
//     }
    
//     function updateFactoryOwner(address[] memory _addrs, uint8[] memory _vals) onlyOwner public {
//         uint _arrLength = _addrs.length;
//         for (uint i=0; i< _arrLength; i++) {
//             factoryOwnerMap[_addrs[i]] = _vals[i];
//         }
//     }
    
//     function updateClearOwner(address _addr) onlyOwner public {
//         clearOwner = _addr;
//     }
    
//     function emitFee(address _addr, uint256 _ethVal) public {
//         require(factoryOwnerMap[msg.sender]>0, "factory address check");
        
//         feeValue = feeValue.add(_ethVal);
//         feeTotal = feeTotal.add(_ethVal);
//     }
    
//     function clear() public {
//         require(msg.sender == clearOwner, "clear owner address check");
//     }
    
//     function stats() public view returns(address[] memory,  uint256[] memory, uint256) {
//         uint256[] memory _amounts = new uint256[](takerArr.length);
//         uint256 _total = 0;
//         uint _arrLength = takerArr.length;
//         for (uint i=0; i< _arrLength; i++) {
//             uint256 amount = takerValueMap[takerArr[i]];
//             _total = _total.add(amount);
//             _amounts[i] = amount;
//         }
//         return (takerArr, _amounts, _total);
//     }
    
//     constructor(address _statsAddr, address _operatorAddr) Operable(_operatorAddr) public {
//         stakingStatsAddr = _statsAddr;
//     }
    
//     function updateStatsAddr(address _addr) onlyOwner public {
//         require(_addr!=stakingStatsAddr, "check stats address");
//         require(_addr!=address(0), "check stats address 0");
//         stakingStatsAddr = _addr;
//     }
    
//     function stakingMint() onlyOperator onlyBeforeDestruct public {
//         // mint
//         mint();
        
//         // reset feeValue
//         feeValue = 0;
//     }
    
//     function getRewardAmount() public view override returns (uint256) {
//         return feeValue;
//     }
    
//     function mintInfo() public view override returns(address[] memory,  uint256[] memory, uint256) {
//         return IStats(stakingStatsAddr).stats();
//     }
// }












