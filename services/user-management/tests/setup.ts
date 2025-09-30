import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to the root .env
const envPath = path.resolve(__dirname, '../../../.env'); // adjust if needed
const result = dotenv.config({ path: envPath });
