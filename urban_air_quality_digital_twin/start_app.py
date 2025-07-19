#!/usr/bin/env python3
"""
Startup script for Urban Air Quality Digital Twin
This script helps you start both backend and frontend services.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def print_banner():
    print("=" * 60)
    print("🌍 Urban Air Quality Digital Twin")
    print("=" * 60)
    print("A comprehensive digital twin system for air quality monitoring")
    print("with AI-powered insights and predictive modeling.")
    print("=" * 60)

def check_prerequisites():
    """Check if required software is installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    try:
        python_version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"✅ Python: {python_version}")
    except:
        print("❌ Python not found. Please install Python 3.8+")
        return False
    
    # Check Node.js
    try:
        node_version = subprocess.check_output(["node", "--version"], text=True).strip()
        print(f"✅ Node.js: {node_version}")
    except:
        print("❌ Node.js not found. Please install Node.js 16+")
        return False
    
    # Check npm
    try:
        npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
        print(f"✅ npm: {npm_version}")
    except:
        print("❌ npm not found. Please install npm")
        return False
    
    return True

def setup_backend():
    """Setup and start the backend"""
    print("\n🔧 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_dir = Path("venv")
    if not venv_dir.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        activate_script = "venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print("📦 Installing backend dependencies...")
    subprocess.run([pip_cmd, "install", "-r", "requirements.txt"])
    
    # Run CrewAI pipeline to fetch data
    print("🔄 Running CrewAI pipeline to fetch data...")
    try:
        subprocess.run([sys.executable, "run_agents.py"], check=True)
        print("✅ Data pipeline completed successfully!")
    except subprocess.CalledProcessError:
        print("⚠️  Data pipeline had issues, but continuing...")
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print("\n🚀 Starting backend server...")
    
    backend_dir = Path("backend")
    os.chdir(backend_dir)
    
    if os.name == 'nt':  # Windows
        python_cmd = "venv\\Scripts\\python"
    else:  # Unix/Linux/macOS
        python_cmd = "venv/bin/python"
    
    try:
        subprocess.Popen([
            python_cmd, "-m", "uvicorn", "api:app", 
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ])
        print("✅ Backend server started at http://localhost:8000")
        return True
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def setup_frontend():
    """Setup the frontend"""
    print("\n🔧 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return False
    
    os.chdir(frontend_dir)
    
    # Install dependencies
    print("📦 Installing frontend dependencies...")
    subprocess.run(["npm", "install"])
    
    return True

def start_frontend():
    """Start the React frontend"""
    print("\n🚀 Starting frontend server...")
    
    frontend_dir = Path("frontend")
    os.chdir(frontend_dir)
    
    try:
        subprocess.Popen(["npm", "run", "dev"])
        print("✅ Frontend server started at http://localhost:5173")
        return True
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return False

def main():
    print_banner()
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please install required software.")
        return
    
    # Get current directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    print("\n🎯 Choose an option:")
    print("1. Setup everything (backend + frontend)")
    print("2. Start backend only")
    print("3. Start frontend only")
    print("4. Start both services")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == "1":
        # Setup everything
        if setup_backend() and setup_frontend():
            print("\n✅ Setup completed successfully!")
            print("\nTo start the services, run:")
            print("  python start_app.py")
            print("  Then choose option 4")
    
    elif choice == "2":
        # Start backend only
        if setup_backend():
            start_backend()
            print("\n🌐 Backend is running at http://localhost:8000")
            print("📚 API documentation: http://localhost:8000/docs")
            input("\nPress Enter to stop the backend...")
    
    elif choice == "3":
        # Start frontend only
        if setup_frontend():
            start_frontend()
            print("\n🌐 Frontend is running at http://localhost:5173")
            input("\nPress Enter to stop the frontend...")
    
    elif choice == "4":
        # Start both services
        if setup_backend() and setup_frontend():
            print("\n🚀 Starting both services...")
            
            # Start backend
            if start_backend():
                time.sleep(2)  # Give backend time to start
                
                # Start frontend
                if start_frontend():
                    print("\n🎉 Both services are running!")
                    print("🌐 Frontend: http://localhost:5173")
                    print("🔧 Backend: http://localhost:8000")
                    print("📚 API Docs: http://localhost:8000/docs")
                    print("\nPress Ctrl+C to stop both services...")
                    
                    try:
                        while True:
                            time.sleep(1)
                    except KeyboardInterrupt:
                        print("\n🛑 Stopping services...")
    
    elif choice == "5":
        print("👋 Goodbye!")
    
    else:
        print("❌ Invalid choice. Please run the script again.")

if __name__ == "__main__":
    main() 