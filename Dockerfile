FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py ./
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8080} app:app"]