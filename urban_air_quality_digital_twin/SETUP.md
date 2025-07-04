# Digital Twin Air Quality Project - Setup Guide

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Virtual environment** (recommended)
3. **Internet connection** (for downloading free Hugging Face models)

## Installation

### 1. Clone and Setup Environment

```bash
# Navigate to the project directory
cd urban_air_quality_digital_twin

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the project root with optional API keys:

```env
# Weather API Key (optional, for enhanced weather data)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# City list (optional, defaults to London,Paris,New York)
CITY_LIST=London,Paris,New York,Bangalore,Mumbai
```

## Running the Project

### Option 1: Test Individual Tools

```bash
# Test tools without CrewAI (no API key required)
python test_tools.py
```

### Option 2: Run Full Digital Twin Workflow

```bash
# Run the complete CrewAI orchestration (uses free Hugging Face model)
python run_agents.py
```

### Option 3: Run Data Server

```bash
# Start the FastAPI data server
uvicorn tools.data_server:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
urban_air_quality_digital_twin/
├── src/urban_air_quality_digital_twin/
│   ├── tools/
│   │   ├── data_fetcher.py      # Real-time data collection
│   │   ├── preprocess.py        # Data cleaning & normalization
│   │   ├── prediction.py        # ML predictions & LLM analysis
│   │   └── data_server.py       # API endpoints
│   ├── config/
│   │   ├── agents.yaml          # CrewAI agent definitions
│   │   └── tasks.yaml           # Workflow task definitions
│   ├── run_agents.py            # Main orchestration script
│   ├── llm_config.py            # Free LLM configuration
│   └── test_tools.py            # Tool testing script
├── data/
│   ├── raw/                     # Raw data storage
│   └── processed/               # Processed data storage
├── requirements.txt             # Python dependencies
└── README.md                    # Project documentation
```

## Digital Twin Components

### 1. **Data Collection Agent**

- Fetches real-time air quality data
- Collects weather information
- Stores data in structured format

### 2. **Data Processing Agent**

- Cleans and normalizes raw data
- Handles missing values and outliers
- Prepares data for analysis

### 3. **Prediction Agent**

- Generates air quality forecasts
- Performs scenario analysis using free LLM
- Creates visualizations and insights

### 4. **Data Server Agent**

- Exposes processed and predicted data via API
- Provides real-time data access
- Supports dashboard integration

## Free LLM Integration

This project uses **Google's Flan-T5-Base** model from Hugging Face, which is:

- **Completely free** to use
- **No API keys required**
- **Runs locally** on your machine
- **Good for text generation** and analysis tasks

### LLM Capabilities:

- Air quality data analysis
- Health implications assessment
- Recommendations generation
- Scenario analysis explanations

### Model Details:

- **Model**: `google/flan-t5-base`
- **Size**: ~1GB
- **License**: Apache 2.0
- **Type**: Text-to-text generation

## Troubleshooting

### Common Issues

1. **Model Download Issues**

   - Ensure stable internet connection
   - First run may take time to download the model
   - Check available disk space (requires ~2GB)

2. **Memory Issues**

   - The model runs on CPU by default
   - For better performance, ensure 4GB+ RAM
   - GPU acceleration available if CUDA is installed

3. **Import Errors**

   - Make sure you're in the correct directory
   - Verify virtual environment is activated
   - Check that all dependencies are installed

4. **Data Directory Issues**
   - Ensure `data/raw/` and `data/processed/` directories exist
   - Check file permissions

### Getting Help

- Check the `DIGITAL_TWIN_CONCEPT.md` for detailed explanation
- Review the tool source files for implementation details
- Test individual tools using `test_tools.py`

## Performance Tips

1. **First Run**: The first run will download the LLM model (~1GB), which may take several minutes
2. **Subsequent Runs**: Model will be cached locally for faster startup
3. **GPU Acceleration**: Install CUDA for GPU acceleration (optional)
4. **Memory Optimization**: Close other applications if running into memory issues

## Next Steps

1. **Customize Cities**: Modify the data fetcher to include your target cities
2. **Enhance Models**: Add more sophisticated ML models for better predictions
3. **Build Dashboard**: Create a web interface for data visualization
4. **Add IoT Sensors**: Integrate real sensor data for enhanced accuracy
5. **Scale Analysis**: Add more cities or analysis parameters
