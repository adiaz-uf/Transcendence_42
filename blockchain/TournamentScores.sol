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

    event ScoreAdded(uint256 indexed tournamentId, address indexed sender, uint256 left, uint256 right);
    
	event ScoreLabeled(
        uint256 indexed tournamentId,
        uint256 indexed index,
        string label,
        uint256 left,
        uint256 right
    );

    event BulkScoresAdded(
        uint256 indexed tournamentId,
        string[] matchLabels,     // ["Semifinal 1", "Semifinal 2", "Final"]
        uint256[] scoresLeft,     // [5,5,5]
        uint256[] scoresRight,    // [3,4,2]
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addScore(uint256 tournamentId, uint256 scoreLeft, uint256 scoreRight) public onlyOwner {
        tournamentScores[tournamentId].push(Score(msg.sender, scoreLeft, scoreRight, block.timestamp));
        emit ScoreAdded(tournamentId, msg.sender, scoreLeft, scoreRight);
    }

    function addScores(
        uint256 tournamentId,
        string[] calldata matchLabels,
        uint256[] calldata scoresLeft,
        uint256[] calldata scoresRight
    ) public onlyOwner {
        require(scoresLeft.length == scoresRight.length, "length mismatch");
        require(matchLabels.length == scoresLeft.length, "label mismatch");

        uint256 len = scoresLeft.length;
        for (uint256 i = 0; i < len; i++) {
            tournamentScores[tournamentId].push(
                Score(msg.sender, scoresLeft[i], scoresRight[i], block.timestamp)
            );
			emit ScoreLabeled(tournamentId, i, matchLabels[i], scoresLeft[i], scoresRight[i]);
        }

        emit BulkScoresAdded(tournamentId, matchLabels, scoresLeft, scoresRight, block.timestamp);
    }

    function getScores(uint256 tournamentId) public view returns (Score[] memory) {
        return tournamentScores[tournamentId];
    }
}
