# Google Maps Setup Guide

## Quick Setup

1. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Create credentials (API Key)

2. **Add API Key to Project**
   
   **Option 1: Environment Variable (Recommended)**
   - Create a `.env` file in the root directory
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
   
   **Option 2: Direct in Code (Development Only)**
   - Edit `src/components/WardMap.tsx`
   - Replace `YOUR_API_KEY` with your actual API key in the `useLoadScript` hook

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Project**
   ```bash
   npm run dev
   ```

## API Key Restrictions (Recommended for Production)

- Restrict API key to your domain
- Restrict to specific APIs (Maps JavaScript API only)
- Set usage quotas to prevent unexpected charges

## Free Tier

Google Maps offers $200 free credit per month, which is typically enough for development and small-scale production use.



