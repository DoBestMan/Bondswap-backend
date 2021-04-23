pragma solidity 0.6.0;

import "./abstract_factory.sol";



contract FixedPoolFactory is Events, AbstractFactory, Destructor {
    using SafeMath for uint256;

    struct FixedPool {
        string name;
        address payable maker;
        
        uint32 endTime;
        bool enabled;
    
        uint256 tokenRate;
        address tokenaddr;
        uint256 tokenAmount; // left amount
        uint256 units;
        bool onlyHolder;
    }
    
    mapping(uint32 => FixedPool) public fixedPools;
    uint32 public fixedPoolCnt = 0;
    
    
    function createFixedPool(string memory _name, address _tracker, uint256 _amount, uint256 _rate, uint256 _units, uint32 _endTime, bool _onlyHolder) makerFee onlyBeforeDestruct payable public {
        require(_amount>0, "check create pool amount");
        require(_rate>0, "check create pool rate");
        require(_units>0, "check create pool units");
        
        // transfer erc20 token from maker
        IERC20(_tracker).transferFrom(msg.sender, address(this), _amount);
        
        fixedPools[fixedPoolCnt] =  FixedPool({
                maker : msg.sender,
                tokenRate : _rate,
                tokenaddr : _tracker,
                tokenAmount : _amount,
                name: _name,
                endTime: uint32(now) + _endTime,
                units: _units,
                enabled: true,
                onlyHolder: _onlyHolder
            });
        emit CreatePool(fixedPoolCnt, msg.sender, false, _tracker, _amount, _rate, _units);
        fixedPoolCnt++;
    }
    
    function fixedPoolJoin(uint32 _id, uint256 _value) takerFee(_value) payable public {
        require(msg.value > 0, "check value, value must be gt 0");
        require(_value <= msg.value, "check value, value must be le msg.value");
        
        FixedPool storage _pool = fixedPools[_id];
        
        // check pool exist
        require(_pool.enabled, "check pool exists");
        if(_pool.onlyHolder){
            require(hastaked(msg.sender), "only holder");
        }
        // check end time
        require(now < _pool.endTime, "check before end time");
        
        uint _order = _value.mul(_pool.tokenRate).div(_pool.units);
        require(_order>0, "check taker amount");
        require(_order<=_pool.tokenAmount, "check left token amount");
        
        address _taker = msg.sender; // todo test gas
        
        _pool.tokenAmount = _pool.tokenAmount.sub(_order);
        
        // transfer ether to maker
        _pool.maker.transfer(_value);
        
        IERC20(_pool.tokenaddr).transfer(_taker, _order);
   
        emit Join(_id, msg.sender, false, _value, _pool.tokenaddr, _order);
        joinPoolAfter(msg.sender, _value);
    }
    
    function fixedPoolClose(uint32 _id) public {
        FixedPool storage _pool = fixedPools[_id];
        
        require(_pool.enabled, "check pool exists");
        require(_pool.maker == msg.sender, "check maker owner");
        
        
        _pool.enabled = false;
        IERC20(_pool.tokenaddr).transfer(_pool.maker, _pool.tokenAmount);
        emit Close(_id, false);
    }
    
}
