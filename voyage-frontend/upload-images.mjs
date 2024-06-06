import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if the CLOUDINARY_URL environment variable is correctly loaded
if (!process.env.CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL is not defined in the .env file');
}

// Set up Cloudinary configuration using CLOUDINARY_URL
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

// List of images to download and upload
const images = [
  {
    url: 'https://via.placeholder.com/150', // Use a valid image URL for testing
    filename: 'placeholder.jpg'
  },
  // Add more images here
];

// Directory to save downloaded images
const downloadDir = path.join(__dirname, 'public', 'assets');

// Ensure the download directory exists
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Function to download an image
async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to download image from ${url}: ${errorText}`);
  }
  const arrayBuffer = await response.arrayBuffer(); // Use arrayBuffer() instead of buffer()
  fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
  console.log(`Downloaded ${url} to ${filepath}`);
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
  for (const image of images) {
    const filepath = path.join(downloadDir, image.filename);
    try {
      // Download the image
      await downloadImage(image.url, filepath);

      // Upload the image to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(filepath);

      // Optionally, you can update your configuration or code to use the Cloudinary URL
      // For now, just log the Cloudinary URL
      console.log(`Cloudinary URL for ${image.filename}: ${cloudinaryUrl}`);
    } catch (error) {
      console.error(`Error processing ${image.url}`, error);
    }
  }
}

// Start the process
processImages();
