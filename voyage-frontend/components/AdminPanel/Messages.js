import React from "react";

const Messages = ({ message }) => {
  return message ? (
    <div className="absolute bottom-0 left-0 w-full max-w-2xl p-4 bg-blue-500 text-white rounded shadow-md">
      <p>{message}</p>
    </div>
  ) : null;
};

export default Messages;
