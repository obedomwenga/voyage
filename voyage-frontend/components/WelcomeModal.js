"use client";

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="p-8 text-center bg-white rounded shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Welcome to Voyage!</h2>
        <p className="mb-4">Let the hunt begin...</p>
        
        <button onClick={onClose} className="px-4 py-2 text-white bg-blue-500 rounded">Let's GO!</button>
        
      </div>
    </div>
  );
};

export default WelcomeModal;
