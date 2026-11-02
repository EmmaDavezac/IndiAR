# IndiAR Flask API Dockerfile
# Builds the Flask backend API

FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY API.py .

# Expose Flask port
EXPOSE 5000

# Environment variables will be set via docker-compose
ENV MYSQL_HOST=db
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password
ENV MYSQL_DB=indiar

# Run the Flask API
CMD ["python", "API.py"]