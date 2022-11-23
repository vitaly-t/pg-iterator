import Pool from 'pg-pool';
import {createQueryIterable, QueryIterablePool} from '../src';

const cn = {
    database: 'pg-promise-demo',
    user: 'postgres',
    allowExitOnIdle: true
};

const pool = new Pool(cn);

(async function () {
    const q = createQueryIterable(pool);

    let started;

    q.on('fields', fields => {
        console.log('F:', fields);
    });

    try {
        for await(const a of q.query('SELECT * FROM users')) {
            console.log(a);
        }
    } catch (err) {
        console.log('HANDLED:', err);
    }
})();
