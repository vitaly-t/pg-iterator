import Pool from 'pg-pool';
import {QueryIterable} from "./disconnected";

const cn = {
    database: 'pg-promise-demo',
    user: 'postgres',
    allowExitOnIdle: true
};

const pool = new Pool(cn);

(async function () {
    const q = new QueryIterable(pool);
    for await(const a of q.query('SELECT * FROM users')) {
        console.log(a);
    }

    console.log('fields:', q.fields);
})();
