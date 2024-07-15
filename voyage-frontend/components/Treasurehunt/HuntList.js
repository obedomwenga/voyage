// components/HuntList.js

import React from 'react';

const HuntList = ({ hunts, handleHuntClick }) => (
  <>
    <h2 className="text-lg font-bold mb-2 text-white">Active Hunts</h2>
    {hunts.length > 0 ? (
      hunts.map((hunt, index) => (
        <div key={index} className="mb-4 cursor-pointer text-white" onClick={() => handleHuntClick(index)}>
          <h3>{hunt.PlaceID}</h3>
          <p>{hunt.Clue}</p>
        </div>
      ))
    ) : (
      <p className="text-white">No Active Hunts</p>
    )}
  </>
);

export default HuntList;
