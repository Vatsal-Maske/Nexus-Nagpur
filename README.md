# Nagpur Nexus - AI Traffic Risk Heatmap & Police Deployment System

An intelligent traffic management system for Nagpur City that uses AI to predict traffic risks and optimize police deployment decisions. This system was developed as a submission for the Manthan Yuva Competition.

## 🚀 Features

- **Real-time Traffic Map**: Interactive GIS map showing traffic junctions, police stations, and patrol units
- **AI-Powered Risk Scoring**: Composite risk analysis combining live vehicle density with historical accident data
- **CCTV Monitoring**: Live camera feeds integration with YOLOv11 vehicle detection
- **Ranked Risk Matrix**: Prioritized list of high-risk junctions requiring immediate attention
- **Shift Management**: Automated officer roster system with shift-based deployment
- **Incident Simulator**: One-click simulation of traffic scenarios for training and planning
- **Police Deployment Recommendations**: AI-driven suggestions for optimal officer allocation

## 🏗️ System Architecture

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Leaflet** - Interactive mapping library
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization charts
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.x** - Core backend logic
- **YOLOv11** - Real-time vehicle detection and tracking
- **OpenCV** - Computer vision processing
- **Pandas** - Data manipulation and analysis

## 📊 Risk Scoring Model

The system computes a composite Risk Score using the formula:

```
Risk Score = (0.40 × Live Density) + (0.60 × Historical Accident Score)
```

**Risk Levels:**
- **High Risk (0.70 – 1.00)**: Immediate officer deployment required
- **Medium Risk (0.40 – 0.69)**: Standby alert + elevated monitoring
- **Low Risk (0.00 – 0.39)**: Normal patrol

## 🗺️ Coverage Area

The system covers **4 Police Zones** in Nagpur City:

1. **Zone 1 - Central Nagpur** (Sitabuldi Police Station)
2. **Zone 2 - North/Sadar** (Sadar Police Station)
3. **Zone 3 - East/Itwari** (Lakadganj Police Station)
4. **Zone 4 - South/Wardha Road** (Ajni Police Station)

**Total Junctions Monitored:** 12
**Total Officers:** 13

## 🚦 Key Junctions

- Variety Square (Sitabuldi)
- Jhansi Rani Square
- Sadar Bazaar Square
- Telephone Exchange Square
- Chhatrapati Square (Wardha Rd)
- Zero Mile Freedom Park
- Pride Hotel Square (Airport Rd)
- And more...

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Backend Setup

1. Navigate to the project directory
2. Install Python dependencies:
```bash
pip install fastapi uvicorn pydantic pandas scikit-learn opencv-python ultralytics
```

3. Start the FastAPI server:
```bash
python backend/api.py
```

The backend will run on `http://127.0.0.1:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the Vite development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
NagpurNexus/
├── backend/
│   ├── api.py              # FastAPI backend server
│   ├── risk_engine.py      # Risk scoring logic
│   └── dispatch_engine.py  # Police deployment algorithms
├── src/
│   ├── components/
│   │   ├── CameraFeeds.jsx       # CCTV monitoring component
│   │   ├── ControlMap.jsx         # Interactive map component
│   │   ├── RiskMatrix.jsx         # Risk ranking table
│   │   ├── ShiftManager.jsx       # Officer roster management
│   │   ├── IncidentSimulator.jsx  # Scenario simulation
│   │   └── ReportViewer.jsx       # Project report display
│   ├── data/
│   │   └── mockData.js            # Mock dataset for development
│   ├── App.jsx                    # Main application component
│   └── main.jsx                   # React entry point
├── data/
│   └── nagpur_dataset.json        # Police zones, junctions, officers data
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Node dependencies
├── vite.config.js                 # Vite configuration
└── tailwind.config.js             # TailwindCSS configuration
```

## 🔧 API Endpoints

### Traffic Data
- `GET /api/dataset` - Get complete dataset
- `GET /api/traffic/junctions` - Get junction data with risk scores
- `GET /api/traffic/heatmap` - Get heatmap data points

### Officers & Deployment
- `GET /api/officers/roster` - Get officer roster by shift
- `GET /api/dispatch/recommend` - Get deployment recommendations
- `POST /api/dispatch/action` - Log dispatch actions

### Simulation
- `POST /api/simulation/update` - Update simulation parameters
- `GET /api/yolo/telemetry` - Get YOLO detection telemetry

## 🎯 Use Cases

1. **Real-time Monitoring**: Control room operators can monitor traffic conditions across all junctions
2. **Emergency Response**: Quick identification of high-risk areas requiring immediate police attention
3. **Resource Optimization**: Data-driven deployment of limited police resources to maximum effect
4. **Training & Planning**: Incident simulator for training officers and planning for special events
5. **Historical Analysis**: Track accident patterns and identify blackspots for infrastructure improvements

## 🏆 Competition

This project was developed for the **Manthan Yuva Competition** under the theme "Intelligent Traffic Management System".

## 📝 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React, Vite, TailwindCSS, Leaflet |
| Backend | FastAPI, Python |
| AI/ML | YOLOv11, OpenCV, scikit-learn |
| Database | JSON (can be upgraded to PostgreSQL/MongoDB) |
| Maps | Leaflet + OpenStreetMap |

## 🤝 Contributing

This is a competition project. For suggestions or improvements, please contact the development team.

## 📄 License

This project is part of the Manthan Yuva Competition submission.

## 🙏 Acknowledgments

- Nagpur Traffic Police for providing data and insights
- Manthan Yuva Competition organizers
- Open-source community for the amazing tools and libraries

---

**Nagpur City Traffic Police AI Decision Support System • Manthan Yuva Submission**
