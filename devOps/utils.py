import os

from django.core.mail import EmailMessage

def send_db_backup(file_path, recipient="scotfielddaniel@gmail.com"):

    subject = "Digistore DB Backup"

    body = "Attached is the latest Digistore database backup."

    email = EmailMessage(subject, body, to=[recipient])
    
    email.attach_file(file_path)

    email.send()
