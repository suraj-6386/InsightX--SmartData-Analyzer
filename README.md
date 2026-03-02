# InsightX Pro
### Advanced Data Analytics & Visualization Suite — PowerBI-Level Analytical Engine

> *From raw spreadsheets to enterprise-grade statistical insights — entirely in your browser.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)
[![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF)](https://recharts.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)]()

---

## 📋 Abstract / Executive Summary

InsightX Pro is a **fully client-side, no-backend** analytics dashboard built with React.js that transforms raw CSV and Excel datasets into interactive, publication-quality visualizations and statistical insights in seconds. Designed as a PowerBI-inspired alternative that runs entirely in the browser, InsightX Pro goes far beyond visualization — implementing a comprehensive **statistical analysis engine** with correlation matrices, outlier detection, regression analysis, forecasting, pivot tables, dynamic filtering, and formula fields. All computations are performed in the browser using pure mathematical implementations with no external analytics libraries, demonstrating deep understanding of data science fundamentals.

---

## 🧠 Theoretical Framework

### Problem Statement

Modern organizations generate vast amounts of tabular data, yet converting raw data into actionable analytical insights typically requires:
- Expensive licensed tools (Microsoft Power BI, Tableau, MATLAB)
- Python/R data science environments with steep learning curves
- Cloud infrastructure with data privacy implications
- Separate engineering teams for backend APIs

### The Solution

InsightX Pro bridges this gap by bringing **enterprise-grade analytics directly into the browser**. The application demonstrates that modern browser JavaScript is a capable platform for sophisticated statistical computation, implementing algorithms from scratch:

- **No analytics cloud dependency** — all math runs client-side
- **Data privacy first** — no data leaves the user's machine
- **Academic portfolio quality** — implements real statistical formulas, not approximations
- **Instant insights** — KPI cards, charts, and statistics appear automatically upon file upload

---

## ✨ Core Features

### 🗄️ Data Engine
| Feature | Description |
|---|---|
| CSV Upload | Drag-and-drop or click; parsed by **PapaParse** |
| Excel Upload | `.xlsx` parsed client-side using **SheetJS (XLSX)** |
| Global State | **Context API** (`DataContext`) feeds data to all components simultaneously |
| Data Cleaning | Remove nulls, duplicates, convert types, handle missing values |
| Column Drop | Interactive chip UI to select and permanently remove columns |
| Data Export | Download cleaned/enriched dataset as CSV or Excel |

### 🔬 Advanced Statistical Engine
| Feature | Implementation |
|---|---|
| Mean, Median, Mode | Standard descriptive statistics |
| Std Dev & Variance | Sample & population variants |
| Skewness | Fisher's moment coefficient of skewness |
| Kurtosis | Excess kurtosis (Fisher's definition, normal = 0) |
| IQR Outlier Detection | Tukey's fence method (Q1 ± 1.5×IQR) |
| Per-value Outlier Flags | Each data point flagged as outlier/normal with direction |
| Column Interpretations | Auto-generated labels (Approximately Symmetric, Highly Right-Skewed, etc.) |

### 🔗 Correlation & Regression
| Feature | Implementation |
|---|---|
| Pearson Correlation | r = Σ(xi−x̄)(yi−ȳ) / √(Σ(xi−x̄)² × Σ(yi−ȳ)²) |
| Correlation Matrix | Full n×n matrix across all numeric columns |
| Linear Regression | OLS least squares: m = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²) |
| R² Coefficient | Coefficient of determination |
| Strength Labels | Very Strong / Strong / Moderate / Weak / Negligible |
| Clickable Heatmap | Click any cell for detailed r, R², strength, direction |

### 📦 Box & Whisker Analysis
| Feature | Description |
|---|---|
| Distribution Histogram | 20-bin frequency histogram with IQR overlay |
| Q1 / Median / Q3 Reference Lines | Visual quartile markers |
| Outlier Fences | Lower/upper Tukey fence with red reference lines |
| Outlier Alert Banner | Red notification with exact outlier values |
| Column Selector | Switch between any numeric column |

### 📈 Scatter + Trendline
| Feature | Description |
|---|---|
| OLS Regression Line | Overlaid as dashed amber line |
| R² & Pearson r Display | Live stat summary row |
| Outlier Points | Highlighted in red diamond shape |
| Dynamic X/Y Selectors | Switch any two numeric columns |
| Regression Equation | ŷ = mx + b displayed below chart |

### 🔮 Forecast Engine
| Feature | Implementation |
|---|---|
| Simple Moving Average | Configurable window (3–7 points) |
| Linear Regression Extrapolation | Extends OLS trendline to future N points |
| Confidence Intervals | ±1.5 × residual std dev, widens over horizon |
| Combined Series Chart | Actual / SMA / Trend / Forecast lines overlaid |
| Goal Seek | Estimates which variables drive a target % change |

### 🗂️ Business Intelligence Tools
| Feature | Description |
|---|---|
| Pivot Table | GroupBy any column with Sum/Count/Avg/Min/Max |
| Multi-Criteria Filter | AND/OR logic with 9 operators (>, <, =, !=, contains, startsWith, endsWith, …) |
| Formula Fields | Safe expression parser — create new columns like `Revenue - Cost` |
| Real-time Preview | See formula result for first 3 rows before applying |
| Live Row Count | Filter preview shows matching row count instantly |

### 📊 Visualization
| Feature | Description |
|---|---|
| Auto KPI Cards | Animated counters: Rows, Columns, Numeric Fields, Missing % |
| Trend Line Chart | Recharts multi-series LineChart |
| Pie / Donut Chart | Category distribution with toggle |
| Stats Comparison Bar | Mean / Min / Max across numeric columns |
| Custom Chart Builder | 15 chart types via **Apache ECharts** |
| Export PNG | html2canvas export for any chart |
| Fullscreen Mode | Browser Fullscreen API |

### 🎨 User Experience
| Feature | Description |
|---|---|
| Dark / Light Mode | One-click toggle + localStorage persistence |
| Primary Color Picker | 6 preset swatches, CSS variable engine |
| Glassmorphism UI | backdrop-filter blur cards |
| Framer Motion | Page transitions, card entrances, hover animations |
| Responsive Sidebar | Slim mode at 769–1024px, hidden below 768px |
| Missing Value Heatmap | Color-coded grid showing null cells |

---

## 🧪 Statistical Implementation Details

### Skewness Formula
```
Skewness = n / ((n-1)(n-2)) × Σ((xi - x̄) / s)³
```
**Interpretation:**
- |skew| < 0.5 → Approximately Symmetric
- 0.5 < |skew| < 1 → Moderately Skewed
- |skew| > 1 → Highly Skewed

### Kurtosis (Excess / Fisher's)
```
Kurtosis = [(n(n+1))/((n-1)(n-2)(n-3))] × Σ((xi-x̄)/s)⁴  −  [3(n-1)²/((n-2)(n-3))]
```
- **Mesokurtic** = 0 (Normal distribution)
- **Leptokurtic** > 0 (Heavy tails, more outliers)
- **Platykurtic** < 0 (Light tails, fewer outliers)

### IQR Outlier Detection (Tukey's Fence)
```
Q1 = 25th percentile, Q3 = 75th percentile, IQR = Q3 - Q1
Lower Fence = Q1 - 1.5 × IQR
Upper Fence = Q3 + 1.5 × IQR
Outlier: value < Lower Fence OR value > Upper Fence
```

### Pearson Correlation Coefficient
```
r = Σ(xi - x̄)(yi - ȳ) / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]
Range: [-1, 1]  |  |r| ≥ 0.9 = Very Strong
```

### Linear Regression (OLS)
```
m = (n×Σxy − Σx×Σy) / (n×Σx² − (Σx)²)
b = (Σy − m×Σx) / n
R² = 1 − (SSres / SStot)
```

---

## 🛠️ Technical Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    InsightX Pro Tech Stack                       │
├─────────────────┬───────────────────────────────────────────────┤
│ Core Framework  │ React 19 + Vite 7                             │
│ Styling         │ Custom CSS (CSS Variables + Glassmorphism)    │
│                 │ Bootstrap 5 (form controls, grid)             │
│ Animations      │ Framer Motion 11                              │
│ Charts          │ Recharts 2 + Apache ECharts 6                │
│ Statistics      │ Pure JavaScript (custom implementations)     │
│ Data Parsing    │ PapaParse 5 (CSV) + SheetJS/XLSX (Excel)     │
│ File Upload     │ react-dropzone                                │
│ PDF Export      │ jsPDF 4 + jspdf-autotable                    │
│ Image Capture   │ html2canvas                                   │
│ Persistence     │ localStorage (theme + color preferences)     │
│ State           │ React Context API + useState/useMemo          │
│ Build Tool      │ Vite (ESM, HMR, fast builds)                 │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
User's Browser (100% Client-Side — No Backend)
│
├── File System (drag & drop / click)
│       │  .csv / .xlsx
│       ▼
│   ┌─────────────┐    PapaParse / XLSX    ┌──────────────────┐
│   │ FileUpload  │ ──────────────────────►│  DataContext.jsx  │
│   │ Component   │                        │  (Global Store)   │
│   └─────────────┘                        └────────┬─────────┘
│                                                   │
│    ┌──────────────────────────────────────────────┤
│    │              │              │                 │
│    ▼              ▼              ▼                 ▼
│  Dashboard   AnalysisDash    DataCleaning      Reports
│  (Overview/   (8 sub-tabs)   (Heatmap +       (PDF Gen)
│   Builder/     ↓              ColDrop)
│   Table)   ┌──────────────────────────────┐
│             │ Statistical Engine Layer    │
│             │  statisticsUtils.js         │
│             │  regressionUtils.js         │
│             │  pivotUtils.js              │
│             │  forecastingUtils.js        │
│             └──────────────────────────────┘
│             ┌──────────────────────────────┐
│             │ Custom React Hooks           │
│             │  useStatistics()            │
│             │  useCorrelation()           │
│             │  useOutliers()              │
│             │  useForecast()              │
│             │  usePivot()                 │
│             └──────────────────────────────┘
│             ┌──────────────────────────────┐
│             │ Analysis Components          │
│             │  CorrelationMatrix.jsx       │
│             │  BoxPlotChart.jsx            │
│             │  ScatterTrendlineChart.jsx   │
│             │  ForecastChart.jsx           │
│             │  PivotTable.jsx              │
│             │  FilterBuilder.jsx           │
│             │  FormulaFields.jsx           │
│             └──────────────────────────────┘
│
│   localStorage
│   (theme, primary color)
```

---

## 📁 Project Structure

```
insightx_dse/
├── src/
│   ├── components/
│   │   ├── analysis/              ← Business Intelligence UI
│   │   │   ├── FilterBuilder.jsx  — AND/OR multi-criteria filter
│   │   │   ├── FormulaFields.jsx  — calculated column creator
│   │   │   └── PivotTable.jsx     — GroupBy pivot with charts
│   │   ├── charts/                ← Visualization layer
│   │   │   ├── AutoChartGrid.jsx
│   │   │   ├── BoxPlotChart.jsx   — IQR distribution + outliers
│   │   │   ├── CategoryPieChart.jsx
│   │   │   ├── ChartBuilder.jsx   — 15-type ECharts builder
│   │   │   ├── CorrelationMatrix.jsx — Pearson R heatmap
│   │   │   ├── ForecastChart.jsx  — SMA + regression forecast
│   │   │   ├── ScatterTrendlineChart.jsx — OLS scatter
│   │   │   ├── SummaryStatsChart.jsx
│   │   │   └── TrendLineChart.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx        — 4-page navigation
│   │   │   └── Topbar.jsx         — brand + upload + theme
│   │   └── ui/
│   │       ├── ChartCard.jsx      — PNG export + fullscreen
│   │       └── StatCard.jsx       — animated counter KPI
│   ├── context/
│   │   └── DataContext.jsx        — global data + theme store
│   ├── hooks/
│   │   ├── useCorrelation.js      — memoized Pearson matrix
│   │   ├── useDataProcessor.js    — column type detection
│   │   ├── useForecast.js         — SMA + regression forecast
│   │   ├── useOutliers.js         — IQR outlier detection
│   │   ├── usePivot.js            — filter + pivot + formula
│   │   └── useStatistics.js       — 7-metric column stats
│   ├── pages/
│   │   ├── AnalysisDashboard.jsx  ← 8-tab ANALYSIS ENGINE
│   │   ├── Dashboard.jsx          — 3-tab overview
│   │   ├── DataCleaning.jsx       — column drop + heatmap
│   │   └── Reports.jsx            — PDF generator
│   ├── utils/                     ← PURE MATH LAYER
│   │   ├── analysisService.js
│   │   ├── forecastingUtils.js    — SMA + goal seek
│   │   ├── pivotUtils.js          — GroupBy + filter + formula
│   │   ├── regressionUtils.js     — Pearson + OLS + R²
│   │   └── statisticsUtils.js     — 7 statistics + IQR
│   ├── services/
│   │   ├── parserService.js       — CSV + XLSX parsing
│   │   └── pdfService.js          — jsPDF report generator
│   ├── App.jsx                    — 4-page router
│   ├── index.css                  — 1800-line design system
│   └── main.jsx
├── index.html                     — sync theme init script
└── README.md
```

---

## 💻 Installation & Setup

### Step 1 — Clone
```bash
git clone https://github.com/YOUR_USERNAME/insightx-pro.git
cd insightx-pro/insightx_dse
```

### Step 2 — Install
```bash
npm install
```

### Step 3 — Run
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Step 4 — Use
1. Upload a `.csv` or `.xlsx` file (drag-drop or Upload Data button)
2. **Dashboard** → KPI cards + auto charts appear instantly
3. **Analysis** → 8 analytical tabs: statistics, correlation, box plots, regression, forecast, pivot, filter, formula
4. **Data Cleaning** → drop columns, fix nulls, visualize with heatmap
5. **Reports** → download complete PDF analytics report

---

## 🗺️ Project Roadmap

| Phase | Feature | Status |
|---|---|---|
| v1.0 | CSV/Excel upload + ECharts custom builder | ✅ Complete |
| v2.0 | Context API + Recharts + glassmorphism themes | ✅ Complete |
| v2.5 | Statistical engine + correlation + outliers + regression | ✅ Complete |
| v2.6 | Forecast (SMA + linear) + goal seek | ✅ Complete |
| v2.7 | Pivot table + multi-criteria filter + formula fields | ✅ Complete |
| v3.0 | Real-time data via REST APIs / WebSockets | 🔄 Planned |
| v3.1 | Cloud storage (Firebase / Supabase) | 🔄 Planned |
| v4.0 | AI-powered auto-insights using Gemini API | 💡 Concept |
| v4.1 | Natural language query interface | 💡 Concept |

---

## 🎓 "Topper-Level" Analytical Feature Summary

| Feature | Mathematical Basis | Impact |
|---|---|---|
| **Correlation Matrix** | Pearson r across all numeric pairs | Multi-variable relationship discovery |
| **Outlier Detection** | Tukey IQR fence method | Data quality assurance |
| **Skewness & Kurtosis** | Fisher's moment coefficients | Distribution shape analysis |
| **Regression Trendlines** | OLS least squares with R² | Predictive modeling |
| **Forecast Engine** | SMA + linear extrapolation + CI | Time-series planning |
| **Goal Seek** | Correlation-weighted impact scoring | Business scenario analysis |
| **Pivot Logic** | GroupBy with 5 aggregations | BI workflow replication |
| **Formula Fields** | Safe expression parser | Derived metric creation |

---

## 🎓 Conclusion

InsightX Pro represents a graduate-level implementation of data science concepts within a modern React architecture. The project demonstrates:

1. **Mathematical depth**: Implementing skewness, kurtosis, Pearson correlation, and OLS regression from scratch in JavaScript
2. **Software architecture**: Separation of concerns via pure utility modules → hooks → components → pages
3. **React mastery**: Context API global state, `useMemo` performance optimization, custom hooks, composition patterns
4. **UI/UX engineering**: Glassmorphism, CSS custom property theming, Framer Motion animations, responsive design
5. **Data science reasoning**: Correlation-based goal seeking, confidence intervals, outlier interpretation

The "no-backend" architecture proves that modern browsers can serve as complete data analysis platforms — a key insight for understanding edge computing, privacy-first analytics, and embedded analytics applications.

---

## 📄 License

MIT License — free to use for academic and personal projects.

---

<div align="center">
  <strong>InsightX Pro</strong> · Statistical Engine + PowerBI-inspired Dashboard<br/>
  Built with React 19, Recharts, ECharts, and Pure Mathematics<br/>
  MCA — Data Science Engineering Lab Project · 2026
</div>
