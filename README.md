# MTA Congestion Relief Zone Analytics

A multi-feature dashboard for understanding MTA Congestion Avoidance Zones with a 3D interactive map, predictor for current congestion and crowdedness in zones, and multifaceted analytics.

## Tech Stack

- React with TypeScript
- Vite for fast development
- Lightweight Charts for high-performance financial-style charts
- Tailwind CSS for styling
- Lucide React for icons
- Mapbox for 3D mapping and interactivity
- Regular Javascript & HTML

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:3000) in your browser
5. IMPORTANT: Download the occupancy_analysis.csv file from the link and add it to public/data: https://drive.google.com/file/d/1BL4tts7UcR3hmqHFVg1rAC8bYEKME1cv/view?usp=drive_link

## Project Structure

- `/src/components` - React components including ChartCard and ChartDashboard
- `/src/hooks` - Custom React hooks including useCsvData for data fetching
- `/src/utils` - Utility functions
- `/src/types` - TypeScript type definitions

## About

This project visualizes traffic data for various entry points to Manhattan's Congestion Relief Zone, providing insights into traffic patterns and trends.
