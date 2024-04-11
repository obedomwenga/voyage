//SPDX-License-Identifier: Unlicense
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

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

    event TreasureHuntStarted(uint256 nonce, uint256 reward, string clue, string url);
    event TreasureHuntSolved(uint256 nonce, address indexed solver, uint256 reward, string answer);
    event IncorrectAnswer(uint256 nonce, address indexed guesser, uint256 feePaid, uint256 guessCount, string answer);

    uint256 public entryFeeVOY;
    uint256 public entryFeeFTM;
    uint256 public treasureChest;
    address public answerSigner = 0xF550B7Ee011f974BcCB389aD2A76bbB5463a3495;
    address payable public feeCollector = payable(0x11157D586e425acf3604eEAdaaae7bb89dF70242);
    
    IERC20 public voyToken;
    uint256 public huntCount;
    uint256 public activeHuntNonce;

    mapping(uint => TreasureHunt) public treasureHunts;
    
    constructor(address voyTokenAddress) {
        voyToken = IERC20(voyTokenAddress);
        entryFeeVOY = 100 ether;
        entryFeeFTM = 0.1 ether;
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

    function submitTreasureHunt(bytes memory signedAnswer, string memory clue, string memory url, uint256 reward) external {
        require(msg.sender == answerSigner, "TreasureHunt: Unauthorised");
        require(voyToken.balanceOf(address(this)) + treasureChest >= reward, "TreasureHunt: Insufficient VOY balance");
        huntCount += 1;

        TreasureHunt memory treasureHunt = TreasureHunt(
            huntCount,
            clue,
            url,
            block.timestamp,
            signedAnswer,
            0,
            false,
            address(0)
        );
        treasureHunts[huntCount] = treasureHunt;
        treasureChest += reward;
        activeHuntNonce = huntCount;
        emit TreasureHuntStarted(huntCount, treasureChest, clue, url);
    }
    
    function submitAnswer(string memory guess) external payable returns(bool) {
        require(msg.value == entryFeeFTM, "TreasureHunt: Incorrect FTM entry fee");
        feeCollector.transfer(msg.value);
        require(voyToken.balanceOf(msg.sender) >= entryFeeVOY, "TreasureHunt: Insufficient VOY balance");
        
        TreasureHunt storage treasureHunt = treasureHunts[activeHuntNonce];
        require(!treasureHunt.solved, "TreasureHunt: No active hunt");

        treasureHunt.guessCount += 1;

        bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(guess))));
        address signer = recoverSigner(message, treasureHunt.signedAnswer);
        bool correct = signer == answerSigner;
        if (!correct) {
            voyToken.transferFrom(msg.sender, feeCollector, entryFeeVOY);
            emit IncorrectAnswer(treasureHunt.nonce, msg.sender, entryFeeVOY, treasureChest, guess);
            return false;
        } else {
            uint256 reward = treasureChest;
            treasureChest = 0;
            voyToken.transfer(msg.sender, reward);
            treasureHunt.solved = true;
            treasureHunt.winner = msg.sender;
            emit TreasureHuntSolved(treasureHunt.nonce, msg.sender, reward, guess);
            return true;
        }
    }

    function activeHuntInfo() public view returns (TreasureHunt memory treasureHunt, uint256 reward) {
        treasureHunt = treasureHunts[activeHuntNonce];
        reward = treasureChest;
    }

    function huntInfo(uint256 nonce) external view returns(TreasureHunt memory) {
        return treasureHunts[nonce];
    }

    function recoverSigner(bytes32 message, bytes memory sig) public pure returns (address) {
       uint8 v;
       bytes32 r;
       bytes32 s;
       (v, r, s) = splitSignature(sig);
       return ecrecover(message, v, r, s);
   }

   function splitSignature(bytes memory sig) public pure returns (uint8, bytes32, bytes32) {
       require(sig.length == 65);
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