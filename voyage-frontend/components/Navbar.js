"use client";

import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold flex items-center">
        <Image src="/voyage-logo.png" alt="Voyage" width={32} height={32} className="mr-2" />
        Voyage
      </div>
      <div className="flex items-center">
        <a href="/treasure-hunt" className="mx-2">Treasure Hunt</a>
        <a href="#staking" className="mx-2">Staking</a>
        <a href="#buy-voy" className="mx-2">Buy VOY</a>
        <button className="bg-blue-500 px-4 py-2 rounded">Connect</button>
      </div>
    </nav>
  );
};

export default Navbar;
