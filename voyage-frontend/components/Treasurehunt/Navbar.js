"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Drawer from './Drawer';

const Navbar = ({ account, balance, connectWallet, disconnectWallet, loading }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-black bg-opacity-30 text-white">
      <div className="text-lg font-bold flex items-center">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        <Link href="/">Voyage</Link>
      </div>
      <div className="sm:hidden">
        <button onClick={toggleDrawer} className="text-white">
          &#9776;
        </button>
      </div>
      <div className="hidden sm:flex items-center">
        <Link href="/#game-rules" className="mx-2">Game Rules & Tips</Link>
        {account ? (
          <div className="flex items-center space-x-2">
            <span className="bg-green-500 px-4 py-2 rounded">
              TBNB: {balance.eth}
            </span>
            <span className="bg-green-500 px-4 py-2 rounded">
              VOY: {balance.voy}
            </span>
            <span className="bg-green-500 px-4 py-2 rounded">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
            <button onClick={disconnectWallet} className="bg-red-500 px-4 py-2 rounded">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="bg-blue-500 px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={toggleDrawer}
        account={account}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
    </nav>
  );
};

export default Navbar;
