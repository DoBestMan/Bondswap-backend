pragma solidity >=0.6.2 <0.7.0;
import "remix_tests.sol"; 
import "remix_accounts.sol"; 


import "./v0.5.sol";

import "./erc20_zoom.sol";



contract ZoomTest  {

    ZoomProtocolToken tracker;
    PoolFactory factory;
    
    function beforeAll () public {
        factory = new PoolFactory();
        tracker = new ZoomProtocolToken();
        tracker.approve(TestsAccounts.getAccount(0), 10**18);
    }
    
    
    /// #sender: account-0
    function checkSenderIs1 () public payable {
        // IERC20(tracker).balanceOf(msg);
        
        factory.createFixedPool{sender: TestsAccounts.getAccount(0)}("jie0", address(tracker), 10**18, 22, 10, 1000, false);
        
        Assert.equal(factory.fixedPools(0).enabled, false, "fixed pool create fail");
    }
    // /// #sender: account-0
    // /// #value: 10
    // function checkSenderIs0AndValueis10 () public payable{
    //     Assert.equal(msg.sender, TestsAccounts.getAccount(0), "wrong sender in checkSenderIs0AndValueis10");
    //     Assert.equal(msg.value, 10, "wrong value in checkSenderIs0AndValueis10");
    // }
    // /// #value: 100
    // function checkValueIs100 () public payable{
    //     Assert.equal(msg.value, 100, "wrong value in checkValueIs100");
    // }
}