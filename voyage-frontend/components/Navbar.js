"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState({ eth: 0, voy: 0 });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Address:", address); // Debugging log
        setAccount(address);

        // Fetch ETH balance
        const ethBalance = await provider.getBalance(address);
        console.log("ETH Balance:", ethBalance.toString()); // Debugging log
        const formattedEthBalance = ethers.utils.formatUnits(ethBalance, 18);

        // Fetch VOY balance from the contract
        const voyContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          ['function balanceOf(address owner) view returns (uint256)'],
          signer
        );
        const voyBalance = await voyContract.balanceOf(address);
        console.log("VOY Balance:", voyBalance.toString()); // Debugging log
        const formattedVoyBalance = ethers.utils.formatUnits(voyBalance, 18);

        setBalance({
          eth: formattedEthBalance,
          voy: formattedVoyBalance,
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
        if (error.code === -32000) {
          alert("Cannot estimate gas; transaction may fail or may require manual gas limit.");
        } else {
          alert("An error occurred while connecting the wallet.");
        }
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white">
      <div className="text-lg font-bold flex items-center">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        <Link href="/">Voyage</Link>
      </div>
      <div className="flex items-center">
        <Link href="/#game-rules" className="mx-2">Game Rules & Tips</Link>
        {account ? (
          <div className="flex items-center space-x-2">
            <span className="bg-green-500 px-4 py-2 rounded">
              ETH: {balance.eth}
            </span>
            <span className="bg-green-500 px-4 py-2 rounded">
              VOY: {balance.voy}
            </span>
            <span className="bg-green-500 px-4 py-2 rounded">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
          </div>
        ) : (
          <button onClick={connectWallet} className="bg-blue-500 px-4 py-2 rounded">Connect Wallet</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
