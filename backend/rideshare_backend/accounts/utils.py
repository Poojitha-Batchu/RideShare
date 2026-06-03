import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings


# Utility function to send signup confirmation email
def send_signup_mail(user_email, user_name):

    sender_email = settings.EMAIL_HOST_USER
    receiver_email = user_email

    subject = "Welcome to RideShare 🚗"

    body = f"""
        Hi {user_name},

        Welcome to RideShare!

        Your account has been created successfully.

        Now you can:
        - Offer rides
        - Book rides
        - Travel safely with others

        Thank you for joining RideShare 🚗

        Regards,
        RideShare Team
    """

    try:

        # Create MIME message
        message = MIMEText(body, "plain", "utf-8")

        message["From"] = sender_email
        message["To"] = receiver_email
        message["Subject"] = subject

        # Send email using SMTP
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, settings.EMAIL_HOST_PASSWORD)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        print("Email sent successfully!")

    except Exception as e:
        print("Mail Error:", e)

# Utility function to send password changed email
def send_password_changed_mail(user_email, user_name):

    sender_email = settings.EMAIL_HOST_USER
    subject = "Password Changed Successfully"

    body = f"""
        Hi {user_name},

        Your RideShare account password has been changed successfully.

        If this was not done by you, please contact support immediately.

        Regards,
        RideShare Team
    """

    try:
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = user_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain", "utf-8"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, settings.EMAIL_HOST_PASSWORD)
        server.sendmail(sender_email, user_email, message.as_string())
        server.quit()

    except Exception as e:
        print(e)
