import redis
from rq import Connection, Worker
from dotenv import load_dotenv
import os

load_dotenv()

queues = ["default"]
redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT")
redis_connection = redis.Redis(host=redis_host, port=int(redis_port), db=0)

if __name__ == "__main__":
    with Connection(redis_connection):
        worker = Worker(queues)
        worker.work()
