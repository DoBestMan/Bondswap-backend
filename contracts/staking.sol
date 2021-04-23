pragma solidity 0.6.0;


import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";


interface IStaking {
    function hastaked(address _who) external returns(bool);
    function stats() external view returns(address[] memory,  uint256[] memory, uint256);
    function clear() external;
}

contract Staking is Ownable {
    using SafeMath for uint256;
    
    struct Holder {
        address holder;
        bool created;
        uint256 stakeAmount;
        uint32  releaseTime;
    }

    mapping(address => uint32) public holderIndexMap;
    Holder[] public stakingHolders;
    uint32 holderCnt = 0;
    
    address public tracker;
    
    constructor(address _tracker) public {
        tracker = _tracker;
        initHolder(address(0));
    }
    
    function getAndInitHolder(address _who) private returns(Holder storage){
        require(_who!=address(0), "check holder address");
        
        uint32 index = holderIndexMap[_who];
        if(index!=0){
            Holder storage holder = stakingHolders[index];
            require(holder.created, "check holder created");
            
            return holder;
        }
        return initHolder(_who);
    }
    function initHolder(address _who) private returns(Holder storage){
        holderIndexMap[_who] = holderCnt;
        holderCnt++;
        stakingHolders.push(
            Holder({
                holder: _who,
                created: true,
                stakeAmount:0,
                releaseTime:0
            }));
        require(holderCnt == stakingHolders.length, "length check");
        return stakingHolders[holderCnt-1];
    }
    
    function stake(uint256 _amount) public {
        require(_amount>0, "check stake amount");
        
        Holder storage holder = getAndInitHolder(msg.sender);
        
        require(holder.created, "check holder create");
        require(holder.holder == msg.sender, "check holder");
        require(holder.releaseTime==0, "check release time");
        
        holder.stakeAmount = holder.stakeAmount.add(_amount);
        IERC20(tracker).transferFrom(msg.sender, address(this), _amount);
    }
    
    function unstake() public {
        Holder storage holder = getAndInitHolder(msg.sender);
        
        require(holder.created, "check holder create");
        require(holder.holder == msg.sender, "check holder");
        require(holder.stakeAmount>0, "check stakeAmount");
        require(holder.releaseTime==0, "check release time");

        holder.releaseTime = calcReleaseTime();
    }
    
    function calcReleaseTime() private view returns  (uint32) {
        return ( uint32(now) / uint32(86400) + 2 ) * uint32(86400);
    }
    
    function withdraw() public {
         Holder storage holder = getAndInitHolder(msg.sender);
        
        require(holder.created, "check holder create");
        require(holder.holder == msg.sender, "check holder");
        require(holder.stakeAmount>0, "check stakeAmount");
        require(holder.releaseTime!=0, "check release time zero");
        require(holder.releaseTime<now, "check release time");
        
        uint256 _order = holder.stakeAmount;
        holder.stakeAmount = 0;
        holder.releaseTime = 0;
        IERC20(tracker).transfer(msg.sender, _order);
    }
   
    function stats() public view returns(address[] memory, uint256[] memory, uint256){
        uint _realLength = 0;
        
        uint _holdersLength = stakingHolders.length;
        for (uint i=0; i< _holdersLength; i++) {
            Holder memory holder = stakingHolders[i];
            if(holder.stakeAmount>0 && holder.releaseTime==0){
                _realLength++;
            }
        }
        
        uint _index = 0;
        uint256 _totalAmount = 0;
        address[] memory _addrs = new address[](_realLength);
        uint256[] memory _amounts = new uint256[](_realLength);
        for (uint i=0; i< _holdersLength; i++) {
            Holder memory holder = stakingHolders[i];
            if(holder.stakeAmount>0 && holder.releaseTime==0){
                _addrs[_index] = holder.holder;
                _amounts[_index] = holder.stakeAmount;
                _totalAmount =  _totalAmount.add(holder.stakeAmount);
                _index++;
            }
        }
        return (_addrs,_amounts,_totalAmount);
    }
    function clear() public{
    }
}


