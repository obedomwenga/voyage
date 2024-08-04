"use client";

import Link from 'next/link';

const Drawer = ({ isOpen, onClose }) => {
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
          <Link href="/#documentation" legacyBehavior>
            <a className="text-black">Documentation</a>
          </Link>
          <Link href="/#roadmap" legacyBehavior>
            <a className="text-black">Roadmap</a>
          </Link>
          <Link href="/#tokenomics" legacyBehavior>
            <a className="text-black">Tokenomics</a>
          </Link>
          <Link href="/#game-rules" legacyBehavior>
            <a className="text-black">Game Rules & Tips</a>
          </Link>
          <Link href="/treasure-hunt" legacyBehavior>
            <a className="bg-blue-500 px-4 py-2 rounded text-center text-white">Launch Treasure Hunt</a>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Drawer;
