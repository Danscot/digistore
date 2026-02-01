#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /home/ubuntu/digistore

source venv/bin/activate

git pull --rebase

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py collectstatic --noinput

sudo systemctl reload nginx

sudo systemctl restart digistore

echo "✅ Deployment finished!"
