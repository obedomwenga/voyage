"use client";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center space-x-4 mb-4 ">
          <a href="#documentation" className="hover:underline">Documentation</a>
          <a href="#roadmap" className="hover:underline">Roadmap</a>
          <a href="#tokenomics" className="hover:underline">Tokenomics</a>
          <a href="#game-rules" className="hover:underline">Game Rules & Tips</a>
        </div>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/discord.svg" alt="Discord" className="w-6 h-6" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" />
          </a>
        </div>
        <p>&copy; 2024 Voyage. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
