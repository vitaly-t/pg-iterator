import Pool from 'pg-pool';
import {createQueryIterable, QueryIterablePool} from '../src';

const cn = {
    database: 'pg-promise-demo',
    user: 'postgres',
    allowExitOnIdle: true
};

interface IUser {
    id: number;
    name: string;
}

const pool = new Pool(cn);

(async function () {

    const q = createQueryIterable<IUser>(pool);

    let started;

    q.on('fields', fields => {
        console.log('F:', fields);
    });

    try {
        for await(const a of q.query('SELECT * FROM users')) {
            console.log(a.name);
        }
    } catch (err) {
        console.log('HANDLED:', err);
    }
})();
