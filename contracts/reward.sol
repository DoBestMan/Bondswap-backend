pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";



abstract contract Reward is Ownable {
    using SafeMath for uint256;
    uint256 private dayRewardAmount;
    
    mapping(address => uint256) rewardDetails;
    address[] rewardAddr;
    
    uint32 public lastMintDayTime;
    uint32 public units;
    
    event Mint(uint32 time, uint256 amount);
    
    constructor() public {
        units = 86400;
    }
    
    function updateUnits(uint32 _units) onlyOwner public{
        units = _units;
    }
    
    // update lastDayTime
    function refreshMintDay() internal returns(uint16)  {
        uint32 _units = units;
        uint32 _dayTime = ( uint32(now) / _units ) * _units;
        require(_dayTime>lastMintDayTime, "day time check");
        lastMintDayTime = _dayTime;
    }
    
    function clearReward() private {
        uint _addrsLength = rewardAddr.length;
        for (uint i=0; i< _addrsLength; i++) {
            delete rewardDetails[rewardAddr[i]];
        }
        delete rewardAddr;
    }
    
    function mint() internal {
        // clear reward
        clearReward();
        
        address[] memory _addrs;
        uint256[] memory _amounts;
        uint256 _total;
        (_addrs, _amounts, _total) = mintInfo();
        
        require(_addrs.length == _amounts.length, "check length");
        require(_total > 0, "check total");
        
        uint256 _rewardAmount = getRewardAmount();
        
        uint _addrsLength = _addrs.length;
        for (uint i=0; i< _addrsLength; i++) {
            require(_addrs[i]!=address(0), "check address");
            require(_amounts[i]>0, "check amount");
            
            rewardDetails[_addrs[i]] = _amounts[i].mul(_rewardAmount).div(_total);
            rewardAddr.push(_addrs[i]);
        }
        
        emit Mint(lastMintDayTime, _rewardAmount);
    }
    
    function withdraw() public {
        uint256 _amount = rewardDetails[msg.sender];
        require(_amount>0, "check reward amount");
        // clear
        rewardDetails[msg.sender] = 0;
        
        transferTo(msg.sender, _amount);
    }
    
    function myReward(address addr) public view returns(uint256){
        return rewardDetails[addr];
    }
    
    function withdrawInfo() public view returns(uint32, address[] memory,  uint256[] memory, uint256) {
        uint256[] memory _amounts = new uint256[](rewardAddr.length);
        uint256 _total = 0;
        uint _arrLength = rewardAddr.length;
        for (uint i=0; i< _arrLength; i++) {
            uint256 amount = rewardDetails[rewardAddr[i]];
            _total = _total.add(amount);
            _amounts[i] = amount;
        }
        return (lastMintDayTime, rewardAddr, _amounts, _total);
    }
    
    function transferTo(address _to, uint256 _amount) internal virtual;
    function getRewardAmount() public view virtual returns (uint256);
    function mintInfo() public view virtual returns(address[] memory,  uint256[] memory, uint256);
}
