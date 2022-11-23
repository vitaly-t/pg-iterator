import Pool from 'pg-pool';
import {createQueryIterable} from '../src';

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

    // const client = await pool.connect();
    const q = createQueryIterable<IUser>(pool);

    let started;

    q.on('fields', fields => {
        // console.log('F:', fields);
    });

    try {
        // for await(const a of q.query('insert into users(id, name) values($1, $2)', [6, 'extra-1'])) {
        for await(const a of q.query('SELECT * FROM users')) {
            console.log(a);
        }
        // client.release();
    } catch (err) {
        console.log('HANDLED:', err);
    }
})();
