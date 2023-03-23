import Dexie from 'dexie';

self.onmessage = async () => {
  const res = await fetch(
    'https://dofus-lab.s3.us-east-2.amazonaws.com/db_dump/dofuslab-items-dump.json',
  );

  console.log(await res.json());

  console.log('hi');

  const db = new Dexie();

  console.log({ db });
};
