pragma solidity 0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/math/SafeMath.sol";



contract UnitTest {
    using SafeMath for uint;
    
    function unsafeSubtract() public pure returns (uint256) {
        uint256 a = 0;
        return a - 1;
    }

    function safeSubtract() public pure returns (uint256) {
        uint256 a = 0;
        return a.sub(1);
    }
}