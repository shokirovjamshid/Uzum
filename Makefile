mig:
	python3 manage.py makemigrations apps
	python3 manage.py migrate

celery:
	celery -A root worker -l INFO

celery-beat:
	celery -A root beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

flower:
	celery -A root.celery flower --port=5001