import redis
from urllib.parse import urlparse
from rq import Connection, Worker
from dotenv import load_dotenv
import os

load_dotenv()

queues = ["default"]
redis_url = os.getenv("REDIS_URL")

url = urlparse(redis_url)
redis_connection = redis.Redis(
    host=url.hostname, port=url.port, db=0, password=url.password
)

if __name__ == "__main__":
    with Connection(redis_connection):
        worker = Worker(queues)
        worker.work()
