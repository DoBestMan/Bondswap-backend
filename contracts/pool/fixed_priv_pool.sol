pragma solidity 0.6.0;

import "./abstract_factory.sol";

contract PrivFixedPoolFactory is Events, AbstractFactory, Destructor {
    using SafeMath for uint256;

    struct PrivFixedPool {
        string name;
        address payable maker;
        
        uint32 endTime;
        bool enabled;
    
        uint256 tokenRate;
        address tokenaddr;
        uint256 tokenAmount; // left amount
        uint256 units;
        address[] takers;
    }
    
    mapping(uint32 => PrivFixedPool) public privFixedPools;
    
    uint32 public privFixedPoolCnt = 0;
    
    function createPrivFixedPool(string memory  _name, address _tracker, uint256 _amount, uint256 _rate, uint256 _units, uint32 _endTime, address[] memory _takers)
        makerFee onlyBeforeDestruct payable public {
            
        require(_amount>0, "check create pool amount");
        require(_rate>0, "check create pool amount");
        require(_units>0, "check create pool amount");
        
        
        // transfer erc20 token from maker
        IERC20(_tracker).transferFrom(msg.sender, address(this), _amount);
        
        privFixedPools[privFixedPoolCnt] =  PrivFixedPool({
                maker : msg.sender,
                tokenRate : _rate,
                tokenaddr : _tracker,
                tokenAmount : _amount,
                name: _name,
                endTime: uint32(now) + _endTime,
                units: _units,
                enabled: true,
                takers: _takers
            });
        
        emit CreatePool(privFixedPoolCnt, msg.sender, true, _tracker, _amount, _rate, _units);
        
        privFixedPoolCnt++;
    }
    
    function privFixedPoolJoin(uint32 _id, uint32 _index, uint256 _value) takerFee(_value) payable public {
        require(msg.value > 0, "check value, value must be gt 0");
        require(_value <= msg.value, "check value, value must be le msg.value");
        
        PrivFixedPool storage _pool = privFixedPools[_id];
        
        // check pool exist
        require(_pool.enabled, "check pool exists");
    
        // check end time
        require(now < _pool.endTime, "check before end time");
        // check taker limit
        require(_pool.takers[_index] == msg.sender, "check taker limit");
        
        uint _order = msg.value.mul(_pool.tokenRate).div(_pool.units);
        require(_order>0, "check taker amount");
        require(_order<=_pool.tokenAmount, "check left token amount");
        
        address _taker = msg.sender; // todo test gas
        
        _pool.tokenAmount = _pool.tokenAmount.sub(_order);
        
        // transfer ether to maker
        _pool.maker.transfer(_value);
        
        IERC20(_pool.tokenaddr).transfer(_taker, _order);
        
        emit Join(_id, msg.sender, true, msg.value, _pool.tokenaddr, _order);
        joinPoolAfter(msg.sender, msg.value);
    }
    
    function privFixedPoolClose(uint32 _id) public {
        PrivFixedPool storage _pool = privFixedPools[_id];
        
        require(_pool.enabled, "check pool exists");
        require(_pool.maker == msg.sender, "check maker owner");
        
        _pool.enabled = false;
        IERC20(_pool.tokenaddr).transfer(_pool.maker, _pool.tokenAmount);
        
        emit Close(_id, true);
    }
    
    
    function privFixedPoolTakers(uint32 _id) public view returns(address[] memory){
        PrivFixedPool storage _pool = privFixedPools[_id];
        return _pool.takers;
    }
}








