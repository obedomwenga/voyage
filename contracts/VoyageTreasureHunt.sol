// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VoyageTreasureHunt is Ownable {
    struct TreasureHunt {
        uint256 nonce;
        string clue;
        string url;
        uint256 start;
        bytes32 solutionHash; // Store the hash instead of signed answer
        uint256 guessCount;
        bool solved;
        address winner;
        uint256 rewardAmount;
    }

    event TreasureHuntStarted(uint256 indexed nonce, uint256 reward, string clue, string url);
    event TreasureHuntSolved(uint256 indexed nonce, address indexed solver, uint256 reward, string answer);
    event IncorrectAnswer(uint256 indexed nonce, address indexed guesser, uint256 feePaid, uint256 guessCount, string answer);

    IERC20 public rewardToken;
    uint256 public rewardAmount;
    uint256 public participationFee;
    uint256 public minimumBalance;
    uint256 public huntInterval;
    uint256 public nextHuntTime;
    uint256 public currentHuntIndex;
    address public answerSigner;
    address payable public feeCollector;

    uint256 public huntCount;
    uint256 public activeHuntNonce;

    mapping(uint256 => TreasureHunt) public treasureHunts;
    mapping(address => uint256) public lastParticipation;

    modifier canParticipate() {
        require(block.timestamp >= nextHuntTime, "Hunt not started yet");
        require(rewardToken.balanceOf(msg.sender) >= minimumBalance, "Insufficient VOY balance to participate");
        require(!treasureHunts[activeHuntNonce].solved, "No active hunt");
        _;
    }

    constructor(IERC20 _rewardToken, uint256 _rewardAmount, uint256 _participationFee, uint256 _minimumBalance, uint256 _huntInterval) {
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
        participationFee = _participationFee;
        minimumBalance = _minimumBalance;
        huntInterval = _huntInterval;
        nextHuntTime = block.timestamp + huntInterval;
    }

    function setHunts(string[] memory _solutions, string[] memory _clues, string[] memory _urls, uint256[] memory _rewards) public onlyOwner {
        require(_solutions.length == _clues.length && _clues.length == _urls.length && _urls.length == _rewards.length, "Array length mismatch");
        for (uint256 i = 0; i < _solutions.length; i++) {
            treasureHunts[i] = TreasureHunt({
                nonce: i,
                clue: _clues[i],
                url: _urls[i],
                start: block.timestamp,
                solutionHash: keccak256(abi.encodePacked(_solutions[i])),
                guessCount: 0,
                solved: false,
                winner: address(0),
                rewardAmount: _rewards[i]
            });
        }
        huntCount = _solutions.length;
    }

    function startNextHunt() public onlyOwner {
        require(currentHuntIndex < huntCount, "All hunts completed");
        nextHuntTime = block.timestamp + huntInterval;
        treasureHunts[currentHuntIndex].solved = true;
        emit TreasureHuntStarted(treasureHunts[currentHuntIndex].nonce, treasureHunts[currentHuntIndex].rewardAmount, treasureHunts[currentHuntIndex].clue, treasureHunts[currentHuntIndex].url);
        currentHuntIndex++;
    }

    function submitAnswer(string memory guess) public canParticipate {
        TreasureHunt storage treasureHunt = treasureHunts[activeHuntNonce];
        treasureHunt.guessCount += 1;

        // Transfer participation fee in VOY tokens directly to the feeCollector
        rewardToken.transferFrom(msg.sender, feeCollector, participationFee);

        if (keccak256(abi.encodePacked(guess)) == treasureHunt.solutionHash) {
            rewardToken.transfer(msg.sender, treasureHunt.rewardAmount);
            treasureHunt.solved = true;
            treasureHunt.winner = msg.sender;
            emit TreasureHuntSolved(treasureHunt.nonce, msg.sender, treasureHunt.rewardAmount, guess);
        } else {
            emit IncorrectAnswer(treasureHunt.nonce, msg.sender, participationFee, treasureHunt.guessCount, guess);
        }
    }

    function rollOverRewards() public onlyOwner {
        require(block.timestamp >= nextHuntTime, "Hunt period not over yet");
        require(currentHuntIndex > 0, "No previous hunt to roll over");
        if (!treasureHunts[currentHuntIndex - 1].solved) {
            treasureHunts[currentHuntIndex].rewardAmount += treasureHunts[currentHuntIndex - 1].rewardAmount;
        }
        startNextHunt();
    }

    function depositRewards(uint256 amount) public onlyOwner {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Deposit transfer failed");
        rewardAmount += amount;
    }

    function withdrawTokens(uint256 amount) public onlyOwner {
        require(rewardToken.transfer(msg.sender, amount), "Withdrawal transfer failed");
        rewardAmount -= amount;
    }

    function getContractTokenBalance() public view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function activeHuntInfo() public view returns (TreasureHunt memory treasureHunt, uint256 reward) {
        treasureHunt = treasureHunts[activeHuntNonce];
        reward = rewardToken.balanceOf(address(this));
    }

    function huntInfo(uint256 nonce) external view returns (TreasureHunt memory) {
        return treasureHunts[nonce];
    }

    function voyBalanceOf(address account) external view returns (uint256) {
        return rewardToken.balanceOf(account);
    }

    function contractVoyBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function recoverSigner(bytes32 message, bytes memory sig) public pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }
}
