"use client";

import Image from 'next/image';
import Link from 'next/link';

const InfoSection = () => {
  return (
    <div className="h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/Jamaica.png")' }}>
      <div className="flex flex-col items-center justify-center h-full text-center text-white bg-black bg-opacity-50 ">
        <h2 className="text-3xl font-bold mb-8">Welcome to Voyage</h2>
        <p className="text-lg mb-16 w-50">
          A fun interactive world run on smart contracts powered by the Fantom Opera Chain.
          <Image src="/FTM-logo.png" alt="Fantom logo" width={25} height={25} className="inline-block ml-2" />
        </p>
        <p className="text-lg mb-16 justify-center "> 
          Voyage's treasure hunting application runs on top of Mapbox. Users are required to explore the globe and look for hidden treasures in the form of VOY tokens and NFTs. Players will be given prompts, hints, riddles, and clues to scout out their riches.
        </p>
        <p className="text-lg mb-16">
          Treasure hunters! Get your thinking hats on and rush to find the prize. Anyone can join in to find treasure, just click launch treasure hunt above. Remember to read the <Link href="/documentation" className="text-blue-500 underline">documentation</Link> before you start. Happy hunting!
        </p>
        <div className="flex justify-center items-center mt-8 space-x-4">
          <Image src="/41_treasure-map.png" alt="treasure-map" width={65} height={65} />
          <Image src="/43_compass.png" alt="compass" width={65} height={65} />
          <Image src="/16_explorer-map.png" alt="explorer-map" width={65} height={65} />
          <Image src="/6_dig-treasure-1.png" alt="dig-treasure" width={65} height={65} />
          <Image src="/7_diamond-treasure-bag.png" alt="diamond-treasure-bag" width={65} height={65} />
          <Image src="/49_pirate-skull.png" alt="pirate-skull" width={65} height={65} />
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
