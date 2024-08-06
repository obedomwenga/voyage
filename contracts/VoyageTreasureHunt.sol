// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VoyageTreasureHuntv6 is Ownable {
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

    event TreasureHuntStarted(
        uint256 indexed nonce,
        uint256 reward,
        string clue,
        string url,
        bytes32 txHash
    );
    event TreasureHuntSolved(
        uint256 indexed nonce,
        address indexed solver,
        uint256 reward,
        string answer
    );
    event IncorrectAnswer(
        uint256 indexed nonce,
        address indexed guesser,
        uint256 feePaid,
        uint256 guessCount,
        string answer
    );
    event HuntExpired(uint256 indexed nonce, uint256 newRewardAmount);

    uint256 public entryFeeVOY;
    uint256 public minBalanceVOY;
    uint256 public rewardAmount;
    uint256 public baseRewardAmount;
    address public answerSigner;
    address public feeCollector;
    uint256 public constant DURATION = 4 hours;

    IERC20 public voyToken;
    uint256 public huntCount;
    uint256 public activeHuntNonce;

    mapping(uint256 => TreasureHunt) public treasureHunts;
    uint256[] public unsolvedHuntNonces;

    constructor(address voyTokenAddress, address feeCollectorAddress) {
        voyToken = IERC20(voyTokenAddress);
        entryFeeVOY = 100 * 10 ** 18; // 100 VOY tokens
        minBalanceVOY = 5000 * 10 ** 18; // 5000 VOY tokens
        baseRewardAmount = 600 * 10 ** 18; // 600 VOY tokens
        rewardAmount = baseRewardAmount;
        answerSigner = 0x3C3BBeFf8d5107f888964eeA42b83aefB82BD104;
        feeCollector = feeCollectorAddress;
    }

    function removeVoyTokens() external onlyOwner {
        voyToken.transfer(owner(), voyToken.balanceOf(address(this)));
    }

    function setEntryFeeVOY(uint256 _entryFee) external onlyOwner {
        entryFeeVOY = _entryFee;
    }

    function setMinBalanceVOY(uint256 _minBalance) external onlyOwner {
        minBalanceVOY = _minBalance;
    }

    function setAnswerSigner(address _answerSigner) external onlyOwner {
        answerSigner = _answerSigner;
    }

    function setBaseRewardAmount(uint256 _baseRewardAmount) external onlyOwner {
        baseRewardAmount = _baseRewardAmount;
        rewardAmount = baseRewardAmount;
    }

    function submitTreasureHunts(
        bytes[] memory signedAnswers,
        string[] memory clues,
        string[] memory urls
    ) external onlyOwner {
        require(
            signedAnswers.length == clues.length && clues.length == urls.length,
            "VoyageTreasureHunt: Array lengths must match"
        );

        for (uint256 i = 0; i < signedAnswers.length; i++) {
            require(
                voyToken.balanceOf(address(this)) >= rewardAmount,
                "VoyageTreasureHunt: Insufficient VOY balance"
            );

            // Increment huntCount to get a unique nonce for each hunt
            huntCount += 1;
            uint256 currentNonce = huntCount;

            // Create a new TreasureHunt struct with the incremented nonce
            TreasureHunt memory treasureHunt = TreasureHunt({
                nonce: currentNonce,
                clue: clues[i],
                url: urls[i],
                start: 0, // Set to 0 indicating the hunt has not started
                signedAnswer: signedAnswers[i],
                guessCount: 0,
                solved: false,
                winner: address(0)
            });

            // Store the new hunt in the mapping
            treasureHunts[currentNonce] = treasureHunt;
            unsolvedHuntNonces.push(currentNonce);
        }

        // Automatically activate the next hunt if no active hunt
        if (activeHuntNonce == 0 && unsolvedHuntNonces.length > 0) {
            activateNextHunt();
        }
    }

    function submitAnswer(string memory guess) external returns (bool) {
        require(
            voyToken.balanceOf(msg.sender) >= entryFeeVOY,
            "VoyageTreasureHunt: Insufficient VOY balance"
        );
        require(
            voyToken.balanceOf(msg.sender) >= minBalanceVOY,
            "VoyageTreasureHunt: Minimum balance not met"
        );

        TreasureHunt storage treasureHunt = treasureHunts[activeHuntNonce];
        require(!treasureHunt.solved, "VoyageTreasureHunt: No active hunt");
        require(treasureHunt.start > 0, "VoyageTreasureHunt: Hunt not started");
        require(
            block.timestamp <= treasureHunt.start + DURATION,
            "VoyageTreasureHunt: Hunt expired"
        );

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
            rewardAmount = baseRewardAmount; // Reset the reward amount

            emit TreasureHuntSolved(treasureHunt.nonce, msg.sender, rewardAmount, guess);

            // Remove solved hunt from unsolved list
            removeUnsolvedHuntNonce(activeHuntNonce);

            // Move to the next hunt automatically
            activateNextHunt();

            return true;
        }
    }

    function activateNextHunt() internal {
        // Check if there's an unsolved hunt available
        if (unsolvedHuntNonces.length > 0) {
            uint256 nextNonce = unsolvedHuntNonces[0];
            unsolvedHuntNonces[0] = unsolvedHuntNonces[unsolvedHuntNonces.length - 1];
            unsolvedHuntNonces.pop();

            activeHuntNonce = nextNonce;
            TreasureHunt storage nextHunt = treasureHunts[nextNonce];
            nextHunt.start = block.timestamp; // Set start time for the hunt
            emit TreasureHuntStarted(
                nextNonce,
                rewardAmount,
                nextHunt.clue,
                nextHunt.url,
                keccak256(abi.encodePacked(block.timestamp, msg.sender, nextNonce))
            );
        } else {
            // If no more unsolved hunts are available
            activeHuntNonce = 0;
        }
    }

    function checkRollover() public {
        TreasureHunt storage treasureHunt = treasureHunts[activeHuntNonce];
        if (block.timestamp > treasureHunt.start + DURATION && !treasureHunt.solved) {
            rewardAmount *= 2; // Double the reward for the next hunt
            emit HuntExpired(activeHuntNonce, rewardAmount);

            // Move to the next hunt automatically
            activateNextHunt();
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

    function removeUnsolvedHuntNonce(uint256 nonce) internal {
        for (uint256 i = 0; i < unsolvedHuntNonces.length; i++) {
            if (unsolvedHuntNonces[i] == nonce) {
                unsolvedHuntNonces[i] = unsolvedHuntNonces[unsolvedHuntNonces.length - 1];
                unsolvedHuntNonces.pop();
                break;
            }
        }
    }
}
