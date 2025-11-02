// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

abstract contract VerifyDeployer {

    function getAdmin() internal view returns(address){
        return ERC1967Utils.getAdmin();
    }

    function changeAdmin(address newAdmin) internal {
        require(ERC1967Utils.getAdmin() == address(0) || ERC1967Utils.getAdmin() == msg.sender,"permission denied");
        ERC1967Utils.changeAdmin(newAdmin);
    }

    modifier _senderPermissionVerify {
        require(ERC1967Utils.getAdmin() == msg.sender,"function permission denied");
        _;
    }

    function Admin() public view returns(address){
        return getAdmin();
    }
}