"use client";

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg text-center w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Welcome to Voyage!</h2>
        <p className="mb-4">Let the hunt begin...</p>
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Let&apos;s GO!</button>
      </div>
    </div>
  );
};

export default WelcomeModal;
