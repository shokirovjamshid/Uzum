from apps.tasks import register_key
from root.settings import r
key = register_key("931607665")
remaining_time = r.ttl(key)