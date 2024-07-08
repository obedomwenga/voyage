"use client";

import Link from 'next/link';

const Drawer = ({ isOpen, onClose, account, balance, connectWallet }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-transform transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } bg-black bg-opacity-75`}
      onClick={onClose}
    >
      <div
        className="w-64 bg-white h-full shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="text-right" onClick={onClose}>
          &times;
        </button>
        <nav className="flex flex-col mt-4 space-y-2">
          <Link href="/#game-rules" legacyBehavior>
            <a className="text-black">Game Rules & Tips</a>
          </Link>
          {account ? (
            <div className="flex flex-col space-y-2">
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
            <button onClick={connectWallet} className="bg-blue-500 px-4 py-2 rounded text-center text-white">Connect Wallet</button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Drawer;
