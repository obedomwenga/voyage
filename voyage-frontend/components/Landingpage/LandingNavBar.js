"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Drawer from './Drawer'; // Adjust the import path if needed

const LandingNavbar = () => {
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
          &#9776; {/* Hamburger icon */}
        </button>
      </div>
      <div className="hidden sm:flex items-center space-x-4">
        <Link href="/#documentation" legacyBehavior>
          <a>Documentation</a>
        </Link>
        <Link href="/#roadmap" legacyBehavior>
          <a>Roadmap</a>
        </Link>
        <Link href="/#tokenomics" legacyBehavior>
          <a>Tokenomics</a>
        </Link>
        <Link href="/#game-rules" legacyBehavior>
          <a>Game Rules & Tips</a>
        </Link>
        <Link href="/treasure-hunt" legacyBehavior>
          <a className="bg-blue-500 px-4 py-2 rounded text-center text-white">Launch Treasure Hunt</a>
        </Link>
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={toggleDrawer} />
    </nav>
  );
};

export default LandingNavbar;
