"use client";
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <a href="#documentation" className="hover:underline">Documentation</a>
          <a href="#roadmap" className="hover:underline">Roadmap</a>
          <a href="#tokenomics" className="hover:underline">Tokenomics</a>
          <a href="#game-rules" className="hover:underline">Game Rules & Tips</a>
        </div>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/discord.svg" alt="Discord" width={24} height={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
          </a>
        </div>
        <p>&copy; 2024 Voyage. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
