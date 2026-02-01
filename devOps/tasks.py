import os

import datetime

import tarfile

from django.conf import settings

from .utils import send_db_backup

BACKUP_DIR = "/home/ubuntu/backups/db"

DB_PATH = "/home/ubuntu/digistore/db.sqlite3"

def backup_db_sqlite():

    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")

    backup_file = os.path.join(BACKUP_DIR, f"db_{now}.sqlite3")

    # copy DB
    import shutil

    shutil.copy2(DB_PATH, backup_file)

    # optional: compress
    compressed_file = backup_file + ".tar.gz"

    with tarfile.open(compressed_file, "w:gz") as tar:

        tar.add(backup_file, arcname=os.path.basename(backup_file))

    # optional: remove original copy
    os.remove(backup_file)

    # send via email
    send_db_backup(compressed_file)

    # cleanup old backups (>7 days)
    for f in os.listdir(BACKUP_DIR):

        f_path = os.path.join(BACKUP_DIR, f)

        if os.path.isfile(f_path):

            file_age_days = (datetime.datetime.now() - datetime.datetime.fromtimestamp(os.path.getmtime(f_path))).days

            if file_age_days > 7:
            	
                os.remove(f_path)

    return compressed_file
