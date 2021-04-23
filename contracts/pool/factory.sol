pragma solidity 0.6.0;

import "./bid_pool.sol";
import "./fixed_pool.sol";
import "./fixed_priv_pool.sol";


contract PoolFactory is BidPoolFactory, FixedPoolFactory ,PrivFixedPoolFactory {
    
}
