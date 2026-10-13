import redis
from rq import Connection, Worker
from rq.job import Job
from dotenv import load_dotenv
import os

load_dotenv()

queues = ["default"]
redis_url = os.getenv("REDIS_URL")
redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT", "6379")
redis_connection = (
    redis.from_url(redis_url)
    if redis_url
    else redis.Redis(host=redis_host, port=int(redis_port), db=0)
)


class BackwardCompatibleJob(Job):
    """Keep jobs readable by the currently deployed RQ 1.3 worker.

    Newer RQ releases serialize unset timestamps as empty strings. RQ 1.3
    attempts to parse those strings as dates and crashes before it can execute
    the job. Omitting unset fields retains the older wire representation while
    leaving completed job timestamps untouched.
    """

    def to_dict(self, *args, **kwargs):
        data = super().to_dict(*args, **kwargs)
        for field in ("started_at", "ended_at", "last_heartbeat"):
            if not data.get(field):
                data.pop(field, None)
        return data


if __name__ == "__main__":
    with Connection(redis_connection):
        worker = Worker(queues, job_class=BackwardCompatibleJob)
        worker.work()
