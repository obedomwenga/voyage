// ExistingHunts.js

const ExistingHunts = ({ hunts }) => {
    return (
      <div className="bg-black bg-opacity-75 text-white p-4 rounded-md shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Existing Hunts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Clue</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">Solved</th>
                <th className="px-4 py-2">Winner</th>
              </tr>
            </thead>
            <tbody>
              {hunts.map((hunt, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{hunt.id}</td>
                  <td className="border px-4 py-2">{hunt.clue}</td>
                  <td className="border px-4 py-2">{hunt.startTime}</td>
                  <td className="border px-4 py-2">{hunt.solved ? 'Yes' : 'No'}</td>
                  <td className="border px-4 py-2">{hunt.winner || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default ExistingHunts;
  