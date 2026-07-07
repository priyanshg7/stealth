# Use Python 3.11 Slim Image
FROM python:3.11-slim

# Set Working Directory
WORKDIR /app

# Install System Dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python Requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi uvicorn python-multipart psutil

# Copy Application Code
COPY api/ ./api/
COPY src/ ./src/

# Create models directory (volume mount point)
RUN mkdir -p /app/models/onnx /app/models/metadata

# Expose API Port
EXPOSE 8000

# Run Uvicorn Production Server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
