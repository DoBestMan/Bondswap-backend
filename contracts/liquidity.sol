pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/access/Ownable.sol";


interface ILiquidity {
    function emitJoin(address _taker, uint256 _ethVal) external;
}

contract LiquidityStats is Ownable {
    using SafeMath for uint256;
    
    mapping(address=>uint8) public factoryOwnerMap;
    address public clearOwner;
    
    mapping ( address => uint256 ) public takerValueMap;
    address[] public takerArr;
    
    uint256 public threshold;
    
    constructor(address[] memory _factorys, uint256 _threshold) public {
        uint _arrLength = _factorys.length;
        for (uint i=0; i< _arrLength; i++) {
            factoryOwnerMap[_factorys[i]] = 1;
        }
        threshold = _threshold;
    }
    
    function updateFactoryOwner(address[] memory _addrs, uint8[] memory _vals) onlyOwner public {
        uint _arrLength = _addrs.length;
        for (uint i=0; i< _arrLength; i++) {
            factoryOwnerMap[_addrs[i]] = _vals[i];
        }
    }
    
    function updateThreshold(uint256 _threshold) onlyOwner public {
        threshold = _threshold;
    }
    
    function updateClearOwner(address _addr) onlyOwner public {
        clearOwner = _addr;
    }
    
    function emitJoin(address _taker, uint256 _ethVal) public {
        require(factoryOwnerMap[msg.sender]>0, "factory address check");
        if(_ethVal>=threshold){
            uint256 prev = takerValueMap[_taker];
            if (prev == 0) {
                takerArr.push(_taker);
            }
            takerValueMap[_taker] = prev.add(1);
        }
    }
    
    function clear() public {
        require(msg.sender == clearOwner, "clear owner address check");
        
        uint _arrLength = takerArr.length;
        for (uint i=0; i< _arrLength; i++) {
            delete takerValueMap[takerArr[i]];
        }
        delete takerArr;
    }
    
    function stats() public view returns(address[] memory,  uint256[] memory, uint256) {
        uint256[] memory _amounts = new uint256[](takerArr.length);
        uint256 _total = 0;
        uint _arrLength = takerArr.length;
        for (uint i=0; i< _arrLength; i++) {
            uint256 amount = takerValueMap[takerArr[i]];
            _total = _total.add(amount);
            _amounts[i] = amount;
        }
        return (takerArr, _amounts, _total);
    }
}


