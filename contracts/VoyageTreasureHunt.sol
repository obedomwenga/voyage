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
        bytes signedAnswer;
        uint256 guessCount;
        bool solved;
        address winner;
    }

    event TreasureHuntStarted(uint256 indexed nonce, uint256 reward, string clue, string url);
    event TreasureHuntSolved(uint256 indexed nonce, address indexed solver, uint256 reward, string answer);
    event IncorrectAnswer(uint256 indexed nonce, address indexed guesser, uint256 feePaid, uint256 guessCount, string answer);

    uint256 public entryFeeVOY;
    uint256 public entryFeeFTM;
    uint256 public treasureChest;
    address public answerSigner;
    address public feeCollector;

    IERC20 public voyToken;
    uint256 public huntCount;
    uint256 public activeHuntNonce;

    mapping(uint256 => TreasureHunt) public treasureHunts;

    constructor(address voyTokenAddress, address feeCollectorAddress) {
        voyToken = IERC20(voyTokenAddress);
        entryFeeVOY = 100 ether;
        entryFeeFTM = 0.1 ether;
        answerSigner = 0xF550B7Ee011f974BcCB389aD2A76bbB5463a3495;
        feeCollector = payable(0x11157D586e425acf3604eEAdaaae7bb89dF70242);
    }

    function removeVoyTokens() external onlyOwner {
        voyToken.transfer(owner(), voyToken.balanceOf(address(this)));
    }

    function setEntryFeeVOY(uint256 _entryFee) external onlyOwner {
        entryFeeVOY = _entryFee;
    }
    
    function setEntryFeeFTM(uint256 _entryFee) external onlyOwner {
        entryFeeFTM = _entryFee;
    }

    function setAnswerSigner(address _answerSigner) external onlyOwner {
        answerSigner = _answerSigner;
    }

    function setRewardAmount(uint256 _rewardAmount) external onlyOwner {
        rewardAmount = _rewardAmount;
    }

    function submitTreasureHunt(
        bytes memory signedAnswer,
        string memory clue,
        string memory url
    ) external onlyOwner {
        require(
            voyToken.balanceOf(address(this)) >= rewardAmount,
            "VoyageTreasureHunt: Insufficient VOY balance"
        );

        huntCount += 1;
        uint256 currentNonce = huntCount;
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, msg.sender, currentNonce));

        TreasureHunt memory treasureHunt = TreasureHunt({
            nonce: currentNonce,
            clue: clue,
            url: url,
            start: block.timestamp,
            signedAnswer: signedAnswer,
            guessCount: 0,
            solved: false,
            winner: address(0)
        });

        treasureHunts[currentNonce] = treasureHunt;
        activeHuntNonce = currentNonce;

        emit TreasureHuntStarted(currentNonce, reward, clue, url);
    }
    
    function submitAnswer(string memory guess) external payable returns (bool) {
        require(msg.value == entryFeeFTM, "VoyageTreasureHunt: Incorrect FTM entry fee");
        feeCollector.transfer(msg.value);
        require(voyToken.balanceOf(msg.sender) >= entryFeeVOY, "VoyageTreasureHunt: Insufficient VOY balance");

        TreasureHunt storage treasureHunt = treasureHunts[activeHuntNonce];
        require(!treasureHunt.solved, "VoyageTreasureHunt: No active hunt");

        voyToken.transferFrom(msg.sender, feeCollector, entryFeeVOY);
        treasureHunt.guessCount += 1;

        bytes32 messageHash = keccak256(abi.encodePacked(guess));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        address recoveredSigner = recoverSigner(ethSignedMessageHash, treasureHunt.signedAnswer);
        bool correct = recoveredSigner == answerSigner;

        if (!correct) {
            emit IncorrectAnswer(
                treasureHunt.nonce,
                msg.sender,
                entryFeeVOY,
                treasureHunt.guessCount,
                guess
            );
            return false;
        } else {
            voyToken.transfer(msg.sender, rewardAmount);
            treasureHunt.solved = true;
            treasureHunt.winner = msg.sender;
            emit TreasureHuntSolved(treasureHunt.nonce, msg.sender, rewardAmount, guess);
            return true;
        }
    }

    function activeHuntInfo()
        public
        view
        returns (TreasureHunt memory treasureHunt, uint256 reward)
    {
        treasureHunt = treasureHunts[activeHuntNonce];
        reward = rewardAmount;
    }

    function huntInfo(uint256 nonce) external view returns (TreasureHunt memory) {
        return treasureHunts[nonce];
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "VoyageTreasureHunt: Invalid signature length");
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
