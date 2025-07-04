# File: src/urban_air_quality_digital_twin/llm_config.py
# Description: Configuration for free Hugging Face LLM integration

import os
from transformers.models.auto.tokenization_auto import AutoTokenizer
from transformers.models.auto.modeling_auto import AutoModelForSeq2SeqLM
import torch

# Configuration for free Hugging Face model
HUGGINGFACE_MODEL_NAME = "google/flan-t5-base"  # Free, good for text generation
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def get_huggingface_llm():
    """
    Returns a configured Hugging Face LLM for CrewAI
    """
    try:
        # For now, return a simple configuration
        # CrewAI will handle the LLM setup internally
        return {
            "model_name": HUGGINGFACE_MODEL_NAME,
            "device": DEVICE,
            "max_length": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
            "do_sample": True
        }
    except Exception as e:
        print(f"Error loading Hugging Face model: {e}")
        return None

def get_ollama_llm():
    """
    Fallback to Ollama LLM (requires Ollama to be installed locally)
    """
    try:
        return {
            "model": "llama2:7b",
            "base_url": "http://localhost:11434"
        }
    except Exception as e:
        print(f"Error loading Ollama model: {e}")
        print("No LLM available. Some features may not work.")
        return None

def get_llm_config():
    """
    Returns the LLM configuration for CrewAI agents
    """
    llm_config = get_huggingface_llm()
    if llm_config:
        return {"llm": llm_config}
    return {}

# Model information for documentation
MODEL_INFO = {
    "name": HUGGINGFACE_MODEL_NAME,
    "type": "Free Hugging Face Model",
    "capabilities": [
        "Text generation",
        "Question answering", 
        "Summarization",
        "Translation",
        "Reasoning tasks"
    ],
    "size": "~1GB",
    "license": "Apache 2.0",
    "paper": "https://arxiv.org/abs/2210.11416"
} 