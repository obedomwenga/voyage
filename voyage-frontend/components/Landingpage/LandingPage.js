"use client";

import Image from 'next/image';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/hero4.jpg")' }}>
      <div className="flex flex-col items-center justify-center h-full text-center text-white bg-black bg-opacity-50 px-4">
        <Image src="/voyage-logo.png" alt="Voyage" width={64} height={64} className="mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">VOYAGE</h1>
        <p className="text-lg sm:text-xl mb-4">A fun interactive web 3.0 world run on smart contracts</p>
        <Link href="/treasure-hunt" legacyBehavior>
          <a className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700 transition-colors">Launch Treasure Hunt</a>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
