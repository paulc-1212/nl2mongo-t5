      
#!/bin/bash

set -e

PYTHON_APP_MODULE="app.main:app" 
HOST_IP="0.0.0.0"
PORT="9990"

echo "--------------------------------------------"
echo "Starting NL2Mongo API Natively..."
echo "--------------------------------------------"
echo "IMPORTANT: Make sure you have activated the correct Conda environment"
echo "           (e.g., 'conda activate <env name>') before running this script."
echo "--------------------------------------------"
sleep 2

echo "Launching Uvicorn for $PYTHON_APP_MODULE on $HOST_IP:$PORT ..."
PYTHONPATH="python_inference_api" python -m uvicorn "$PYTHON_APP_MODULE" --host "$HOST_IP" --port "$PORT" --reload

echo "Uvicorn server stopped."

    