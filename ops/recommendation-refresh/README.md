# Weekly recommendation refresh

The suggester is request-serving code and **does not become a cron job**. It
reads the currently published Redis lookup table. The scheduled operation is
the trainer, which performs the expensive PostgreSQL read, builds a complete
lookup table, and atomically publishes it to Redis.

The conservative default schedule is **Sunday at 03:17 UTC, once per week**.
There are no automatic retries. A failure waits for the next scheduled run (or
an operator's deliberate manual run), avoiding repeated expensive database
queries.

## Safety behavior

- `flock` prevents overlap on the scheduler host; a Redis lock also prevents a
  manual or second-host refresh from overlapping.
- The process is CPU/I/O deprioritized, numeric libraries are limited to one
  thread, and the default wall-clock limit is four hours.
- A new Redis hash is built under an unreferenced staging key. Redis atomically
  renames it and changes the reader's version pointer only after the entire
  refresh succeeds. Empty results and failed writes leave the published table
  unchanged.
- The wrapper logs timestamps, outcome, and exit status, but never prints the
  database URL, Redis address, or the environment file.

## Production inputs to confirm first

Do not install the schedule until these are known:

1. The Ubuntu release, host timezone, deployment path, service user, and Python
   executable. The code and wrapper are compatible with Python 3.8 and normal
   Ubuntu 18.04/20.04 utilities (`bash`, `flock`, `timeout`, `nice`, `ionice`).
2. That the chosen host can reach managed PostgreSQL and the self-hosted Redis
   instance with the same environment used by the API.
3. The database's quiet period and an acceptable query/runtime budget. The
   four-hour timeout is a guardrail, not evidence that production training
   normally finishes in that time.
4. Enough Redis headroom for the old published hash and one complete staging
   hash to coexist during refresh.
5. A log retention policy and whichever existing monitoring should alert on a
   non-zero cron result. This change sends no email.

## Install (host Python)

These are operator instructions only; this repository change does not install
or enable anything.

1. Deploy the repository and its existing server environment. Verify the
   Python environment without querying production:

   ```bash
   sudo -u dofuslab /opt/dofuslab/server/.venv/bin/python --version
   sudo -u dofuslab /opt/dofuslab/server/.venv/bin/python -m unittest \
     discover -s /opt/dofuslab/server/tests -p 'test_suggestion_publication.py'
   ```

2. Install the non-secret example config and adjust paths/limits. If application
   secrets must be added because the deployed server does not already load
   them, make the file readable only by root and the service group.

   ```bash
   sudo install -d -m 0755 /etc/dofuslab /var/log/dofuslab
   sudo install -m 0640 -o root -g dofuslab \
     /opt/dofuslab/ops/recommendation-refresh/recommendation-refresh.env.example \
     /etc/dofuslab/recommendation-refresh.env
   sudo touch /var/log/dofuslab/recommendation-refresh.log
   sudo chown dofuslab:dofuslab /var/log/dofuslab/recommendation-refresh.log
   ```

3. Confirm the schedule timezone. Ubuntu cron follows the host timezone; this
   avoids relying on `CRON_TZ`, whose support differs between cron packages.
   Keep UTC or deliberately translate 03:17 UTC into the selected host zone:

   ```bash
   timedatectl
   # Only if UTC is the approved host-wide setting:
   # sudo timedatectl set-timezone UTC
   ```

4. Run a non-production smoke test against isolated PostgreSQL and Redis first.
   A production manual run would execute the expensive query and therefore
   requires a separately approved maintenance window.

5. After review, install the cron file and validate it. Installing it activates
   the schedule, so this step is intentionally left to the operator:

   ```bash
   sudo install -m 0644 \
     /opt/dofuslab/ops/recommendation-refresh/dofuslab-recommendations.cron.example \
     /etc/cron.d/dofuslab-recommendations
   sudo systemctl reload cron
   ```

## Container integration

The pending runtime/container modernization should keep the API and RQ worker
as long-running services, and add the trainer as a **one-shot invocation of the
same server image**, not another serving container. The scheduler should retain
the outer `flock`, four-hour `timeout`, single attempt, low CPU/I/O priority,
and invoke this command inside that one-shot container:

```bash
python -m app.suggester.trainer --days 180 --lock-seconds 18000
```

Pass the existing PostgreSQL and Redis environment by reference (for example,
an env file or secret store); never place credentials in the cron line or
image. Set the one-shot container's CPU and memory limits after measuring an
isolated full-size run. Do not add a container restart policy: retries are
intentionally operator-controlled because the source query is expensive.

## Failure handling

An overlap exits without starting a query and is logged as skipped. Exit `124`
means the four-hour timeout elapsed. Other non-zero exits are logged as
failures. In either failure case, the suggester continues using a complete
published Redis version. Inspect the log and database/Redis health, then choose
whether to wait for the next Sunday or authorize one manual run. Do not put the
wrapper in a retry loop.
