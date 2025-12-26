# Ward-Wise Pollution Action Dashboard

A high-impact GovTech web dashboard for Indian metropolitan cities to transform raw air-quality data into ward-level actionable intelligence for policy intervention and public awareness.

## Features

- **Interactive City Map**: Large interactive map divided into clearly labeled wards, color-coded by AQI severity
- **Ward Intelligence Panel**: Detailed AQI scores, pollutant breakdown, source attribution, and short-term forecasts
- **Action & Policy Recommendations**: Auto-generated ward-specific mitigation actions
- **Analytics & Insights**: Time-series charts, pollution spike detection, and weather impact correlation
- **Alert & Early-Warning System**: High-risk ward alerts, predictive warnings, and priority rankings

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Design Philosophy

- **Government-grade UI**: Minimalist, data-centric, professional
- **White background** with muted color palette
- **Clear typography** with strong visual hierarchy
- **Policy-ready**: Suitable for official government review

## Project Structure

```
src/
  components/        # React components
    WardMap.tsx
    WardIntelligencePanel.tsx
    PolicyRecommendations.tsx
    AnalyticsInsights.tsx
    AlertSystem.tsx
  data/             # Mock data and utilities
    mockData.ts
  types.ts          # TypeScript type definitions
  App.tsx           # Main application component
  main.tsx          # Application entry point
  index.css         # Global styles
```

## License

This project is designed for government use and policy decision-making.


