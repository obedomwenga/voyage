"use client";

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Voyage!</h2>
        <p className="mb-4">Let the hunt begin...</p>
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">Let's GO!</button>
      </div>
    </div>
  );
};

export default WelcomeModal;
