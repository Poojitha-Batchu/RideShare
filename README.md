# RideShare

RideShare is a full-stack ride-sharing application built using **Django (Backend)** and **Angular (Frontend)**. The platform allows users to offer rides, book rides, manage bookings, track ride status, and perform ride-related operations through a modern user interface.

---

## Prerequisites

Make sure the following software is installed on your system:

* Python 3.x
* MySQL
* Node.js
* Angular CLI
* Git

---

## Clone the Repository

```bash
git clone https://github.com/Poojitha-Batchu/RideShare.git <new-folder-name>
```

Navigate to the project directory:

```bash
cd <new-folder-name>
```

---

## Backend Setup

### Create a Virtual Environment

Navigate to the project root directory and create a virtual environment:

```bash
python -m venv <new-venv-name>
```

Activate the virtual environment:

```bash
<new-venv-name>\Scripts\activate
```

### Install Required Dependencies

```bash
pip install -r requirements.txt
```

---

## Database Setup

Login to MySQL and create a new database:

```sql
CREATE DATABASE rideshare_db;
```

### Configure Database Settings

Open:

```text
backend/rideshare_backend/rideshare_backend/settings.py
```

Update the `DATABASES` configuration with your MySQL credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'rideshare_db',
        'USER': '<mysql_username>',
        'PASSWORD': '<mysql_password>',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

---

## Email Configuration

In `settings.py`, update the email configuration with your email credentials:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = '<your_email>'
EMAIL_HOST_PASSWORD = '<your_app_password>'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
```

---

## Create Database Tables

Navigate to the backend directory and run:

```bash
python manage.py makemigrations
python manage.py migrate
```

This will create all required tables in the `rideshare_db` database.

---

## Frontend Setup

Navigate to the Angular project directory:

```bash
cd frontend/rideshare_frontend
```

Install the required packages:

```bash
npm install
```

---

## Running the Application

### Run Backend Server

Open a terminal in the backend directory and run:

```bash
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000/
```

---

### Run Frontend Server

Open another terminal in:

```bash
frontend/rideshare_frontend
```

Run:

```bash
ng serve -o
```

Frontend URL:

```text
http://localhost:4200/
```

---

## Project Structure

```text
RideShare/
│
├── backend/
│   └── rideshare_backend/
│
├── frontend/
│   └── rideshare_frontend/
│
├── requirements.txt
│
└── README.md
```

---

## Features

* User Registration & Authentication
* Offer Rides
* Search Available Rides
* Book Rides
* Ride Cancellation
* Start Ride Functionality
* Ride Status Tracking
* Seat Availability Management
* Profile Management
* Email Notifications

---

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* MySQL

### Frontend

* Angular
* TypeScript
* HTML
* CSS

### Tools

* Git
* GitHub

---

## Author

**Poojitha Batchu**
