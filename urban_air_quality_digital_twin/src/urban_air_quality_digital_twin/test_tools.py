# File: test_tools.py
# Description: Test script to verify tool functionality without CrewAI LLM

import os
import sys
from tools.data_fetcher import main as fetch_data_main
from tools.preprocess import clean_and_preprocess
from tools.prediction import main as prediction_main

def test_tools():
    """Test each tool individually to ensure they work"""
    print("Testing Digital Twin Tools...")
    print("=" * 50)
    
    try:
        print("1. Testing Data Fetcher...")
        fetch_data_main()
        print("   ✓ Data fetcher completed successfully")
    except Exception as e:
        print(f"   ✗ Data fetcher failed: {e}")
    
    try:
        print("2. Testing Data Preprocessor...")
        clean_and_preprocess()
        print("   ✓ Data preprocessor completed successfully")
    except Exception as e:
        print(f"   ✗ Data preprocessor failed: {e}")
    
    try:
        print("3. Testing Prediction Tool...")
        prediction_main()
        print("   ✓ Prediction tool completed successfully")
    except Exception as e:
        print(f"   ✗ Prediction tool failed: {e}")
    
    print("=" * 50)
    print("Tool testing completed!")

if __name__ == "__main__":
    test_tools() 