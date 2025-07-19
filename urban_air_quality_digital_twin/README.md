# Urban Air Quality Digital Twin

A comprehensive digital twin system for monitoring and analyzing urban air quality using real-time data, AI-powered insights, and predictive modeling.

## 🏗️ Architecture

- **Backend**: Python FastAPI with CrewAI agents for data processing and LLM analysis
- **Frontend**: React TypeScript with real-time dashboard and analysis tools
- **Data Sources**: Open-Meteo API for air quality and weather data
- **AI/LLM**: Free Hugging Face models for intelligent analysis
- **Digital Twin**: Real-time data mirroring, predictive modeling, and scenario analysis

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd urban_air_quality_digital_twin/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the CrewAI pipeline to fetch and process data
python run_agents.py

# Start the FastAPI server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd urban_air_quality_digital_twin/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Features

### Dashboard

- Real-time air quality monitoring
- City selection and comparison
- Interactive map with location data
- AI-powered Q&A system
- Data export functionality

### Analysis

- **Forecast & Predictions**: AI-powered air quality forecasting
- **Historical Analysis**: Long-term trend analysis with charts
- **Scenario Analysis**: What-if simulations for urban planning

### Digital Twin Components

- **Data Collection**: Real-time sensor data from Open-Meteo API
- **Data Processing**: Automated cleaning and normalization
- **Predictive Modeling**: ML-based forecasting and scenario analysis
- **AI Insights**: LLM-powered analysis and recommendations

## 🔧 API Endpoints

### Core Data

- `GET /api/cities` - List available cities
- `GET /api/city/{city}/current` - Current air quality data
- `GET /api/city/{city}/trend` - 24-hour trend data
- `GET /api/city/{city}/forecast` - Forecast data
- `GET /api/city/{city}/pollutants` - Pollutant levels

### Analysis

- `GET /api/city/{city}/historical` - Historical data
- `POST /api/city/{city}/scenario` - Scenario analysis
- `GET /api/compare` - City comparison

### AI/LLM

- `POST /api/llm/query` - Free-form AI queries
- `GET /api/city/{city}/insights` - AI-generated insights

### System

- `GET /api/status` - System status
- `GET /api/export/dashboard` - Data export
- `GET /api/map/locations` - Map location data

## 🛠️ Development

### Backend Development

```bash
# Run tests
python test_tools.py

# Run individual tools
python -c "from tools.data_fetcher import main; main()"
python -c "from tools.preprocess import clean_and_preprocess; clean_and_preprocess()"
python -c "from tools.prediction import main; main()"

# Check data files
ls data/processed/
ls data/raw/
```

### Frontend Development

```bash
# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📁 Project Structure

```
urban_air_quality_digital_twin/
├── backend/
│   ├── api.py                 # FastAPI endpoints
│   ├── run_agents.py          # CrewAI orchestration
│   ├── llm_config.py          # LLM configuration
│   ├── tools/
│   │   ├── data_fetcher.py    # Data collection
│   │   ├── preprocess.py      # Data processing
│   │   ├── prediction.py      # ML predictions & LLM
│   │   └── data_server.py     # Data serving
│   ├── config/
│   │   ├── agents.yaml        # CrewAI agents
│   │   └── tasks.yaml         # Workflow tasks
│   └── data/
│       ├── raw/               # Raw API data
│       └── processed/         # Processed data & outputs
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/
│   │   │   └── api.ts         # API service
│   │   └── App.tsx            # Main app
│   └── package.json
└── README.md
```

## 🔄 Data Flow

1. **Data Collection**: CrewAI agents fetch real-time data from Open-Meteo API
2. **Processing**: Data is cleaned, normalized, and stored in structured format
3. **Analysis**: ML models generate forecasts and LLM provides insights
4. **API Serving**: FastAPI serves processed data to frontend
5. **Visualization**: React components display real-time dashboards and charts

## 🤖 AI/LLM Integration

- **Model**: Google Flan-T5-Base (free Hugging Face model)
- **Capabilities**:
  - Air quality analysis and insights
  - Health implications assessment
  - Scenario analysis and recommendations
  - Free-form Q&A about air quality
- **Integration**: CrewAI agents orchestrate LLM-powered analysis

## 🚨 Troubleshooting

### Backend Issues

- **Import Errors**: Ensure virtual environment is activated
- **API Errors**: Check if Open-Meteo API is accessible
- **LLM Errors**: Verify internet connection for model download

### Frontend Issues

- **API Connection**: Ensure backend is running on port 8000
- **Build Errors**: Clear node_modules and reinstall dependencies
- **CORS Issues**: Backend includes CORS middleware

### Data Issues

- **No Data**: Run `python run_agents.py` to fetch fresh data
- **Missing Cities**: Check `CITY_LIST` environment variable
- **Outdated Data**: CrewAI pipeline runs hourly by default

## 📈 Performance

- **Data Refresh**: Every hour (configurable)
- **API Response**: < 200ms for cached data
- **LLM Analysis**: 2-5 seconds for complex queries
- **Memory Usage**: ~2GB for backend, ~500MB for frontend

## 🔮 Future Enhancements

- IoT sensor integration
- Real-time alerts and notifications
- Advanced ML models
- 3D visualization
- Mobile app
- Multi-language support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section
- Review API documentation at `/docs`
- Open an issue on GitHub
