"use client";

import Image from 'next/image';
import Link from 'next/link';

const LandingNavbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-500 text-white">
      <div className="text-lg font-bold flex items-center">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        Voyage
      </div>
      <div className="flex items-center">
        <a href="#documentation" className="mx-2">Documentation</a>
        <a href="#roadmap" className="mx-2">Roadmap</a>
        <a href="#tokenomics" className="mx-2">Tokenomics</a>
        <a href="#game-rules" className="mx-2">Game Rules & Tips</a>
        <Link href="/treasure-hunt" legacyBehavior>
          <a className="bg-blue-500 px-4 py-2 rounded">Launch Treasure Hunt</a>
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;
