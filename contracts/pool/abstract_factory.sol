pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol";
import "../destructor.sol";
import "../liquidity.sol";
import "../staking.sol";
import "../fee.sol";
 

interface Events {
    event CreatePool(uint32 indexed id, address indexed maker, bool priv, address tracker, uint256 amount, uint256 rate, uint256 units);
    event Join(uint32 indexed id, address indexed taker, bool priv, uint256 ethAmount, address tracker, uint256 amount);
    event Close(uint32 indexed id, bool priv);
}


contract AbstractFactory is Ownable {
    address public liquidtyAddr;
    address public stakeAddr;
    address public feeAddr;
    uint32 public constant takerFeeBase = 100000;
    uint32 public takerFeeRate;
    uint256 public makerFixedFee;
    
    constructor() public {
        takerFeeRate = 0;
        makerFixedFee = 0;
    }
    
    modifier makerFee() {
        if(makerFixedFee>0) {
            require(msg.value >= makerFixedFee, "check maker fee, fee must be le value");
            require(feeAddr!=address(0), "check fee address, fail");
            
            // transfer fee to owner
            IFee(feeAddr).emitFee.value(makerFixedFee)(msg.sender, makerFixedFee);
        }
        _;
    }
    
    modifier takerFee(uint256 _value) {
        require(_value>0, "check taker value, value must be gt 0");
        uint256 _fee = 0;
        if(takerFeeRate>0){
            _fee = _value * takerFeeRate / takerFeeBase;
            require(_fee > 0, "check taker fee, fee must be gt 0");
            require(_fee < _value, "check taker fee, fee must be le value");
            require(feeAddr!=address(0), "check fee address, fail");
            
            // transfer fee to owner
            IFee(feeAddr).emitFee.value(_fee)(msg.sender, _fee);
        }
        require(_value+_fee<=msg.value,"check taker fee and value, total must be le value");
        _;
    }
    
    function joinPoolAfter(address _taker, uint256 _ethVal) internal {
        if(liquidtyAddr!=address(0)){
            ILiquidity(liquidtyAddr).emitJoin(_taker, _ethVal);    
        }
    }
    function updateTakerFeeRate(uint32 _rate) public onlyOwner {
        takerFeeRate = _rate;
    }
    function updateMakerFee(uint256 _fee) public onlyOwner {
        makerFixedFee = _fee;
    }
    function updateFeeAddr(address _addr) public onlyOwner {
        feeAddr = _addr;
    }
    function updateLiquidityAddr(address _addr) public onlyOwner {
        liquidtyAddr = _addr;
    }
    function updateStakeAddr(address _addr) public onlyOwner {
        stakeAddr = _addr;
    }
    function hastaked(address _who) internal returns(bool) {
        if(stakeAddr==address(0)){
            return true;
        }
        return IStaking(stakeAddr).hastaked(_who);
    }
}

