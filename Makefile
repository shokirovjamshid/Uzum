celery:
	celery -A proj worker -l INFO

mig:
	python3 manage.py makemigrations apps
	python3 manage.py migrate