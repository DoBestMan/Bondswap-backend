pragma solidity 0.6.0;

import "./abstract_factory.sol";



contract BidPoolFactory is Events, AbstractFactory, Destructor {
    using SafeMath for uint256;

    struct BidPool {
        string name;
        address payable maker;
        
        uint32 endTime;
        bool enabled;
    
        address tokenaddr;
        uint256 tokenAmount; // maker erc20 token amount
        
        uint256 takerAmountTotal; // taker ether coin amount
        uint256 makerReceiveTotal; // maker received = all - fee
        mapping(address=>uint256) takerAmountMap; // taker ether coin amount
        
        bool onlyHolder; // only token holder could join
    }

    mapping(uint32 => BidPool) public bidPools;
    uint32 public bidPoolCnt = 0;

    function createBidPool(string memory  _name, address _tracker, uint256 _amount, uint32 _endTime, bool _onlyHolder) makerFee onlyBeforeDestruct payable public {
        require(_amount>0, "check create pool amount");
        
        // transfer erc20 token from maker
        IERC20(_tracker).transferFrom(msg.sender, address(this), _amount);
        
        
        bidPools[bidPoolCnt] = BidPool({
                name: _name,
                maker : msg.sender,
                endTime: uint32(now) + _endTime,
                tokenaddr : _tracker,
                tokenAmount : _amount,
                takerAmountTotal: 0,
                enabled: true,
                makerReceiveTotal:0,
                onlyHolder:_onlyHolder
            });
        emit CreatePool(bidPoolCnt, msg.sender, false, _tracker, _amount, 0, 0);
        bidPoolCnt++;
    }
    
    function bidPoolJoin(uint32 _id, uint256 _value) takerFee(_value) takerFee(_value) payable public {
        require(msg.value > 0, "check value, value must be gt 0");
        require(_value <= msg.value, "check value, value must be le msg.value");
        
        BidPool storage _pool = bidPools[_id];
        
        // check pool exist
        require(_pool.enabled, "check pool exists");
    
        // check end time
        require(now < _pool.endTime, "check before end time");
        
        // check holder
        if(_pool.onlyHolder){
            require(hastaked(msg.sender), "only holder");
        }
        address _taker = msg.sender;
        _pool.takerAmountMap[_taker] = _pool.takerAmountMap[_taker] + _value;
        _pool.takerAmountTotal = _pool.takerAmountTotal + _value;
        _pool.makerReceiveTotal = _pool.makerReceiveTotal + _value;
        
        emit Join(_id, msg.sender, false, _value, _pool.tokenaddr, 0);
        joinPoolAfter(msg.sender, _value);
    }
    
    function bidPoolTakerWithdraw(uint32 _id) public {
        BidPool storage _pool = bidPools[_id];
    
        // check end time
        require(now > _pool.endTime, "check after end time");
        
        address _taker = msg.sender;
        uint256 _amount = _pool.takerAmountMap[_taker];
        require(_amount>0, "amount check");
        
        uint256 _order = (_amount * _pool.tokenAmount) / _pool.takerAmountTotal;
        
        // clear taker amount
        delete _pool.takerAmountMap[_taker];
        IERC20(_pool.tokenaddr).transfer(_taker, _order);
    }
    
    function bidPoolMakerWithdraw(uint32 _id) public {
        BidPool storage _pool = bidPools[_id];
        // check end time
        require(now > _pool.endTime, "check after end time");
        require(_pool.enabled, "check pool enabled");
        require(_pool.maker == msg.sender, "check pool owner");
        if( _pool.takerAmountTotal == 0 ){
            _pool.enabled = false;
            IERC20(_pool.tokenaddr).transfer(_pool.maker, _pool.tokenAmount);
            return;
        }
        uint256 _order = _pool.makerReceiveTotal;
        require( _order>0, "check received value");
        _pool.makerReceiveTotal = 0;
        msg.sender.transfer(_order);
    }
    
}
