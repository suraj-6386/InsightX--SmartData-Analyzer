# InsightX Pro — Professional Data Intelligence Platform

A high-performance, minimalist data analysis platform built with React, Vite, and modern web technologies. InsightX Pro provides comprehensive data ingestion, cleaning, visualization, and reporting capabilities.

## Features

- **Data Ingestion**: Upload CSV and Excel files with automatic metadata scanning
- **Data Cleaning**: Remove nulls, duplicates, convert data types, treat outliers
- **Visual Analytics**: Interactive charts including bar, line, pie, scatter, and more
- **Statistical Analysis**: Advanced statistics including skewness, kurtosis, correlation
- **PDF Reporting**: Generate professional reports with Tone & Style analysis
- **Modern UI**: Dark Red & White professional theme with light/dark mode

## Tech Stack

- **Frontend**: React 18, Vite, Framer Motion
- **Styling**: CSS Variables, Bootstrap 5
- **Charts**: Recharts, Chart.js
- **Data Processing**: PapaParse, XLSX
- **PDF Generation**: jsPDF, html2canvas
- **Build Tool**: Vite

## New Machine Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd insightx_dse

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

No additional configuration required. The application uses local storage for theme persistence.

## Project Structure

```
insightx_dse/
├── src/
│   ├── components/         # React components
│   │   ├── charts/        # Chart components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── context/            # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## Usage

1. **Upload Data**: Drag and drop or click to upload CSV/Excel files
2. **Explore Dashboard**: View auto-generated KPIs and charts
3. **Clean Data**: Use the Data Cleaning panel to:
   - Remove null values
   - Remove duplicates
   - Convert data types
   - Treat outliers (IQR method)
4. **Build Charts**: Use Chart Builder to create custom visualizations
5. **Generate Reports**: Export professional PDF reports with statistics

## API Keys

No external API keys required. All processing is done client-side.

## Database

No database required. Data is processed in-memory and not persisted.

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact the development team.
