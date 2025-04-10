// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract TournamentScores {
    struct Score {
        address player;
        uint256 scoreLeft;
        uint256 scoreRight;
        uint256 timestamp;
    }

    mapping(uint256 => Score[]) public tournamentScores;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addScore(uint256 tournamentId, uint256 scoreLeft, uint256 scoreRight) public onlyOwner {
        tournamentScores[tournamentId].push(Score(msg.sender, scoreLeft, scoreRight, block.timestamp));
    }

    function getScores(uint256 tournamentId) public view returns (Score[] memory) {
        return tournamentScores[tournamentId];
    }
} 