import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Fix duplicate React caused by Windows path casing issues
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    }
    config.resolve.symlinks = false
    return config
  },
}

export default nextConfig
