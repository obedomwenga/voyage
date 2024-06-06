import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';

dotenv.config(); // Load environment variables from .env file

// Log the CLOUDINARY_URL to verify it's being loaded correctly
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if the CLOUDINARY_URL environment variable is correctly loaded
if (!process.env.CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL is not defined in the .env file');
}

// Set up Cloudinary configuration using CLOUDINARY_URL
cloudinary.config({
  cloud_name: 'dbd6h02ht',
  api_key: '743377291846891',
  api_secret: '6rsMF0H8VMfADSMiuy9UzKsTvUs'
});

// Load Excel file
const workbook = XLSX.readFile(path.join(__dirname, 'voyage treasure hunts1.xlsx'));
const sheet_name_list = workbook.SheetNames;
const sheet = workbook.Sheets[sheet_name_list[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Directory to save downloaded images
const downloadDir = path.join(__dirname, 'public', 'assets');

// Ensure the download directory exists
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Function to download an image
async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download image from ${url}: ${errorText}`);
    }
    const arrayBuffer = await response.arrayBuffer(); // Use arrayBuffer() instead of buffer()
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
    console.log(`Downloaded ${url} to ${filepath}`);
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
  }
}

// Function to upload an image to Cloudinary
async function uploadToCloudinary(filepath) {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      folder: 'voyage-assets' // Optional: specify a folder in your Cloudinary account
    });
    console.log(`Uploaded ${filepath} to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filepath} to Cloudinary`, error);
  }
}

// Main function to download and upload images
async function processImages() {
  for (const item of data) {
    const url = item.URL;
    const filename = path.basename(url);
    const filepath = path.join(downloadDir, filename);
    if (url.trim() === '') {
      console.log('Empty URL, skipping...');
      continue;
    }
    try {
      // Download the image
      await downloadImage(url, filepath);

      // Upload the image to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(filepath);

      // Optionally, you can update your configuration or code to use the Cloudinary URL
      // For now, just log the Cloudinary URL
      console.log(`Cloudinary URL for ${filename}: ${cloudinaryUrl}`);
    } catch (error) {
      console.error(`Error processing ${url}`, error);
    }
  }
}

// Start the process
processImages();
