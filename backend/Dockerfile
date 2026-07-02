FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   build-essential \
	   default-libmysqlclient-dev \
	   pkg-config \
	   libssl-dev \
	&& rm -rf /var/lib/apt/lists/* \
	&& pip install --upgrade pip \
	&& pip install --no-cache-dir -r requirements.txt

COPY . ./

WORKDIR /app/rideshare_backend
RUN python manage.py collectstatic --noinput

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
