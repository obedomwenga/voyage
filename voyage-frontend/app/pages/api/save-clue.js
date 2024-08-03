import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { clueData } = req.body;
    console.log('Received clueData:', clueData); // Debug: Log received data

    const filePath = path.resolve('./public/clues.json');
    console.log('Resolved file path:', filePath); // Debug: Log file path

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Failed to read file:', err);
        return res.status(500).json({ error: 'Failed to read file' });
      }

      console.log('Current file data:', data); // Debug: Log current file data

      let clues = [];
      try {
        clues = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        return res.status(500).json({ error: 'Failed to parse file' });
      }

      clues.push(clueData);

      fs.writeFile(filePath, JSON.stringify(clues, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Failed to write file:', writeErr);
          return res.status(500).json({ error: 'Failed to save file' });
        }

        console.log('File updated successfully.'); // Debug: Log success
        res.status(200).json({ message: 'Clue saved successfully' });
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
