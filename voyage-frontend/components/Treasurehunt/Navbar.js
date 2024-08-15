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
    <nav className="flex items-center justify-between p-4 text-white bg-black bg-opacity-30">
      <div className="flex items-center text-lg font-bold">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        <Link href="/">Voyage</Link>
      </div>
      <div className="sm:hidden">
        <button onClick={toggleDrawer} className="text-white">
          &#9776;
        </button>
      </div>
      <div className="items-center hidden sm:flex">
        <Link href="/#game-rules" className="mx-2">Game Rules & Tips</Link>
        {account ? (
          <div className="flex items-center space-x-2">
            <span className="px-4 py-2 bg-green-500 rounded">
              tFTM: {balance.eth}
            </span>
            <span className="px-4 py-2 bg-green-500 rounded">
              VOY: {balance.voy}
            </span>
            <span className="px-4 py-2 bg-green-500 rounded">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
            <button onClick={disconnectWallet} className="px-4 py-2 bg-red-500 rounded">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 rounded" disabled={loading}>
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
