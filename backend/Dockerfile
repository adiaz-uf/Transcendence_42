FROM python:3.11

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose Django port
EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
