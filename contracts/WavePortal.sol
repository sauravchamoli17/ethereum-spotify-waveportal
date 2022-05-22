// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract WavePortal {
    uint256 totalRecommendationsCount;
    uint256 private seed;

    event NewRecommendation(
        address indexed from,
        uint256 timestamp,
        string musicLink
    );

    struct Recommendation {
        address waver;
        string musicLink;
        uint256 timestamp;
    }

    Recommendation[] recommendations;

    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
      console.log("Ethereum Spotify Waveportal Contract!");
      seed = (block.timestamp + block.difficulty) % 100;
    }

    function sendRecommendation(string memory _musicLink) public {
        require(
          lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
          "Wait 15m"
        );
        lastWavedAt[msg.sender] = block.timestamp;
        totalRecommendationsCount += 1;
        console.log("%s has recommended!", msg.sender);
        recommendations.push(
            Recommendation(msg.sender, _musicLink, block.timestamp)
        );
        seed = (block.difficulty + block.timestamp + seed) % 100;
        if (seed <= 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
              prizeAmount <= address(this).balance,
              "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
        emit NewRecommendation(msg.sender, block.timestamp, _musicLink);
    }

    function getRecommendations()
        public
        view
        returns (Recommendation[] memory)
    {
        return recommendations;
    }

    function getAllRecommendationsCount() public view returns (uint256) {
        return totalRecommendationsCount;
    }
}
