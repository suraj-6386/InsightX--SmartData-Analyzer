# InsightX - Professional Data Analytics Dashboard

A comprehensive ReactJS-based data analytics platform that rivals PowerBI, featuring enterprise-grade data visualization, cleaning, and reporting capabilities.

## ✨ Features

### 📁 Data Management
- **Multi-format Upload**: Drag & drop CSV or Excel files with automatic format detection
- **Smart Parsing**: Robust data parsing using PapaParse and SheetJS libraries
- **Data Validation**: Automatic type detection and data integrity checks

### 🧹 Data Cleaning & Processing
- **Interactive Cleaning Panel**: User-friendly interface for data preprocessing
- **Null Value Handling**: Remove or fill missing values with visual feedback
- **Duplicate Removal**: Automatic detection and removal of duplicate records
- **Type Conversion**: Smart numeric column detection and conversion
- **Real-time Feedback**: Toast notifications for all cleaning operations

### 📊 Advanced Analytics
- **KPI Dashboard**: Professional metrics cards displaying Total, Average, Max, Min values
- **Dynamic Calculations**: Real-time KPI computation across all numeric columns
- **Statistical Analysis**: Comprehensive data statistics and insights

### 📈 Interactive Visualizations (15+ Chart Types)
- **Bar Charts**: Standard and stacked bar visualizations
- **Line Charts**: Single and multi-line trend analysis
- **Area Charts**: Filled area plots for cumulative data
- **Pie & Donut Charts**: Proportional data representation
- **Scatter Plots**: Correlation and distribution analysis
- **Radar Charts**: Multi-dimensional data comparison
- **Heatmaps**: Matrix-based data visualization
- **Histograms**: Frequency distribution analysis
- **Bubble Charts**: Multi-variable data plotting
- **Box Plots**: Statistical distribution summaries
- **Funnel Charts**: Process flow visualization
- **Combo Charts**: Mixed chart type displays

### 🎛️ PowerBI-Style Controls
- **Dynamic Configuration**: Real-time chart customization
- **Field Mapping**: Drag-and-drop column assignment (X-axis, Y-axis, Legend)
- **Aggregation Options**: Sum, Average, Count, Min, Max, Median calculations
- **Interactive Sidebar**: Collapsible control panel for chart management
- **Chart Management**: Add, delete, and modify multiple charts simultaneously

### 📋 Data Table
- **Interactive Table**: Sortable columns with search functionality
- **Pagination**: Efficient handling of large datasets
- **Column Filtering**: Real-time data filtering capabilities
- **Export Ready**: Clean data preparation for downloads

### 📄 Professional Reporting
- **PDF Export**: Comprehensive reports with charts, KPIs, and data tables
- **Multi-page Layout**: Organized report structure with headers and footers
- **High-Quality Rendering**: Crisp chart exports using html2canvas
- **Custom Branding**: Professional report formatting

## 🎨 UI/UX Highlights

- **Enterprise Design**: Modern SaaS analytics interface
- **Gradient Backgrounds**: Professional color schemes with CSS gradients
- **Smooth Animations**: Micro-interactions and hover effects
- **Responsive Layout**: Optimized for desktop and laptop workflows
- **Card-Based Architecture**: Clean, organized component structure
- **Professional Typography**: Consistent font hierarchy and spacing
- **Loading States**: Elegant loading indicators and progress feedback
- **Error Handling**: User-friendly error messages and recovery options

## 🛠️ Tech Stack

### Frontend Framework
- **ReactJS**: Functional components with modern hooks (useState, useEffect, useCallback)
- **Bootstrap 5**: Responsive grid system and component library

### Data Processing
- **PapaParse**: High-performance CSV parsing
- **SheetJS (xlsx)**: Excel file processing and manipulation

### Visualization Engine
- **Apache ECharts**: 15+ chart types with interactive features
- **Dynamic Rendering**: Real-time chart updates and configuration

### Reporting & Export
- **jsPDF**: PDF document generation
- **jspdf-autotable**: Professional table formatting in PDFs
- **html2canvas**: High-fidelity chart screenshot capture

### Development Tools
- **Vite**: Lightning-fast build tool and development server
- **ESLint**: Code quality and consistency enforcement
- **Modern JavaScript**: ES6+ features and best practices

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- Modern web browser

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd insightx_dse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5177
   ```

### Build for Production

```bash
npm run build
```

### Code Quality Checks

```bash
npm run lint
```

## 📖 Usage Guide

### 1. Upload Data
- Drag and drop CSV or Excel files onto the upload area
- Supported formats: `.csv`, `.xlsx`, `.xls`

### 2. Clean Data
- Use the cleaning panel to remove null values and duplicates
- Convert columns to numeric types as needed
- Receive real-time feedback on cleaning operations

### 3. Explore Data
- View data in the interactive table
- Check KPI metrics for quick insights
- Sort, filter, and search through your data

### 4. Create Visualizations
- Click "Add Chart" to create new visualizations
- Select chart type from 15+ available options
- Configure X-axis, Y-axis, and aggregation methods
- Customize chart titles and legends

### 5. Export Results
- Generate comprehensive PDF reports
- Include charts, KPIs, and data summaries
- Download professional reports for sharing

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChartBuilder.jsx    # Chart rendering engine
│   ├── DataTable.jsx       # Interactive data table
│   ├── DataCleaningPanel.jsx # Data cleaning interface
│   ├── KPISection.jsx      # Metrics dashboard
│   ├── SidebarControls.jsx # Chart configuration panel
│   └── FileUpload.jsx      # File upload component
├── pages/               # Page components
│   └── Dashboard.jsx       # Main dashboard layout
├── services/            # Business logic services
│   ├── parserService.js    # File parsing utilities
│   ├── analysisService.js  # KPI calculations
│   └── pdfService.js       # PDF generation
├── utils/               # Utility functions
│   ├── cleaningUtils.js    # Data cleaning logic
│   ├── aggregationUtils.js # Data aggregation
│   └── chartConfig.js      # Chart configuration
└── assets/              # Static assets
```

## 🎯 Key Achievements

- **Professional UI**: Enterprise-grade design matching modern SaaS standards
- **Comprehensive Features**: 15+ chart types with PowerBI-like functionality
- **Robust Data Handling**: Support for multiple file formats and data types
- **Advanced Analytics**: Real-time KPI calculations and statistical analysis
- **Export Capabilities**: Professional PDF reporting with high-quality visuals
- **Performance Optimized**: Efficient rendering and data processing
- **Code Quality**: ESLint compliant with modern React best practices

## 🔧 Development Notes

- Built with modern React patterns and hooks
- Modular architecture for maintainability
- Comprehensive error handling and user feedback
- Responsive design principles
- Performance optimized for large datasets
- Extensible chart system for future enhancements

---

**InsightX** - Transforming data into insights, one visualization at a time.

### Step 1: Get the Project Files
- **Option A**: Clone the repository (if hosted on GitHub/GitLab)
  ```bash
  git clone <repository-url>
  cd insightx_dse
  ```
- **Option B**: Download the ZIP file and extract it to a folder, then navigate to the project directory:
  ```bash
  cd path/to/extracted/folder/insightx_dse
  ```

### Step 2: Install Dependencies
Install all required packages using npm:
```bash
npm install
```

This will install:
- React and React DOM
- Bootstrap for styling
- PapaParse for CSV parsing
- SheetJS (xlsx) for Excel parsing
- ECharts for data visualization
- jsPDF and jspdf-autotable for PDF generation
- react-dropzone for file uploads
- Other development dependencies

**Note**: If you encounter peer dependency warnings, you can use:
```bash
npm install --legacy-peer-deps
```

### Step 3: Start the Development Server
Run the development server:
```bash
npm run dev
```

You should see output like:
```
VITE v7.3.1  ready in 914 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 4: Access the Application
- Open your web browser
- Navigate to `http://localhost:5173/`
- You should see the InsightX dashboard with the navbar

### Step 5: Using the Application
1. **Upload Data**: Drag and drop a CSV or Excel file into the upload area, or click to browse
2. **Preview Data**: View the uploaded data in the paginated table
3. **Clean Data**: Use the cleaning buttons to remove null values, duplicates, or detect numeric columns
4. **Analyze Data**: Check the KPI cards for basic statistics and averages
5. **Create Charts**: Select chart type (Bar/Line/Pie) and choose X/Y columns from dropdowns
6. **Export Report**: Click "Download PDF" to generate and download a report

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Navigation bar
│   ├── FileUpload.jsx          # File upload component
│   ├── DataPreview.jsx         # Interactive data table (renamed from DataTable)
│   ├── DataCleaning.jsx        # Data cleaning tools
│   ├── KPISection.jsx          # KPI metrics cards
│   ├── ChartCard.jsx           # Individual chart component
│   ├── InteractiveDashboard.jsx # Multi-chart dashboard
│   └── PDFExport.jsx           # PDF generation
├── pages/
│   └── Dashboard.jsx           # Main dashboard page
├── services/
│   └── dataParser.js           # Data parsing logic
├── utils/                      # Utility functions (expandable)
├── assets/                     # Static assets
├── App.jsx                     # Main app component
├── main.jsx                    # App entry point
└── index.css                   # Global styles with animations
```

## Chart Features

All charts support:
- **Dynamic Column Selection**: Choose X and Y axes from dropdowns
- **Interactive Tooltips**: Hover for detailed information
- **Legends**: Automatic legend generation
- **Responsive Design**: Auto-resize on window changes
- **Smooth Animations**: ECharts built-in animations
- **Professional Styling**: Consistent with dashboard theme

## Data Controls

- **Search**: Global search across all columns
- **Filter**: Filter by specific column values
- **Sort**: Click column headers to sort ascending/descending
- **Pagination**: Navigate through large datasets efficiently

## PDF Report Contents

The exported PDF includes:
- Project title and generation date
- Dataset summary statistics
- Key performance indicators (KPIs)
- Data preview table (first 20 rows)
- Professional formatting and branding

## Performance Optimizations

- **Memoization**: React hooks for efficient re-renders
- **Lazy Loading**: Components load as needed
- **Efficient Data Processing**: Optimized algorithms for large datasets
- **Responsive Charts**: ECharts handles resizing automatically

## Troubleshooting

### Common Issues:
1. **Port 5173 already in use**: Change port with `npm run dev -- --port 3000`
2. **Build errors**: Ensure Node.js version is compatible
3. **File upload not working**: Check browser console for errors
4. **Charts not rendering**: Ensure ECharts is properly imported

### Build for Production:
```bash
npm run build
npm run preview
```

## License

This project is for educational purposes.
