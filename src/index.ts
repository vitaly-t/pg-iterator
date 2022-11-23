import {Readable} from "stream";
import {QueryIterable} from "./disconnected";

const pg = require('pg');

const QueryStream = require('pg-query-stream')

const cn = {
    database: 'pg-promise-demo',
    user: 'postgres',
    allowExitOnIdle: true
};

const pool = new pg.Pool(cn);

(async function () {
    const q = new QueryIterable(pool);
    for await(const a of q.query('SELECT * FROM users')) {
        console.log(a);
    }
})();
