"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold flex items-center">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        <Link href="/">Voyage</Link>
      </div>
      <div className="flex items-center">
        <Link href="/#game-rules" className="mx-2">Game Rules & Tips</Link>
        {account ? (
          <span className="bg-green-500 px-4 py-2 rounded">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
        ) : (
          <button onClick={connectWallet} className="bg-blue-500 px-4 py-2 rounded">Connect Wallet</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
