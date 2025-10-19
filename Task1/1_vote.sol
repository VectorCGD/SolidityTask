// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract voteCon{
    mapping (address=>uint) votesMap;
    mapping (address=>bool) voted;
    address[] allCandidates;
    function vote(address candidate)public {
        require(voted[msg.sender] == false,"sender voted");
        voted[msg.sender] = true;
        votesMap[candidate]++;
        if (votesMap[candidate] == 1){
            allCandidates.push(candidate);
        }
    }

    function getVotes(address candidate)public view returns(uint){
        return votesMap[candidate];
    }

    function resetVotes()public {
        for (uint256 i = 0; i < allCandidates.length; i++) {
            votesMap[allCandidates[i]] = 0;
        }
    }
}