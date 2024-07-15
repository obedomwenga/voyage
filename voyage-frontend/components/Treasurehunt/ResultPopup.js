// components/Treasurehunt/ResultPopup.js

import React from 'react';

const ResultPopup = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white p-8 rounded-lg shadow-lg z-10 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-teal-700 mb-4">Correct Answer</h2>
        <p className="text-lg">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-full"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ResultPopup;
