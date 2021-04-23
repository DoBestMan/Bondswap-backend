pragma solidity ^0.6.0;

contract BidPoolFactory {
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

    function createBidPool(string memory  _name, address _tracker, uint256 _amount, uint32 _endTime, bool _onlyHolder)  payable public {
       
    }
    
    function bidPoolJoin(uint32 _id, uint256 _value) payable public {
        
    }
    
    function bidPoolTakerWithdraw(uint32 _id) public {
        
    }
    
    function bidPoolMakerWithdraw(uint32 _id) public {
       
    }
}