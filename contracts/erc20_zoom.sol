pragma solidity ^0.6.3;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/presets/ERC20PresetMinterPauser.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/token/ERC20/ERC20Capped.sol";

contract ZoomProtocolToken is ERC20Capped, ERC20PresetMinterPauser {
    
	uint256 private erc20_decimals = 18;
	uint256 private erc20_units = 10**erc20_decimals;
	
	constructor()
	ERC20PresetMinterPauser("Zoom Protocol", "ZOM")
	ERC20Capped(1000000*erc20_units) public{
	    mint(msg.sender, 1000*erc20_units);
	}
	
	 /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20PresetMinterPauser, ERC20Capped) {
        super._beforeTokenTransfer(from, to, amount);
    }
}