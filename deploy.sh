#!/bin/bash
set -e

echo "🚀 Starting deployment..."


echo "🚀 activating env..."

cd /home/ubuntu/digistore

source venv/bin/activate


echo "🚀 pulling up from github..."

git pull --rebase


echo "🚀 installing requirements.."

pip install -r requirements.txt


echo "🚀 DB updates..."

python manage.py makemigrations

python manage.py migrate

python manage.py collectstatic --noinput


echo "🚀 reloading services..."

sudo systemctl reload nginx

sudo systemctl restart digistore

echo "✅ Deployment finished!"
