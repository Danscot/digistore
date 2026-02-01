from django.core.management.base import BaseCommand

from devOps.tasks import backup_db_sqlite

class Command(BaseCommand):
    
    help = "Backup SQLite DB and send via email"

    def handle(self, *args, **kwargs):

        backup_file = backup_db_sqlite()

        self.stdout.write(self.style.SUCCESS(f"Backup created: {backup_file}"))
