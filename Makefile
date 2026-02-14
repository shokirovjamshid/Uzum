celery:
	celery -A proj worker -l INFO

mig:
	python3 manage.py makemigrations
	python3 manage.py migrate