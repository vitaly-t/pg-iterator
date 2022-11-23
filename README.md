# pg-iterator

TypeScript wrapper for [pg-query-stream], to produce strongly-typed `AsyncIterable`-s.

### Using `Pool`
 
When using an existing [Pool] object, this library will automatically acquire the connection,
create `AsyncIterable` from a `query` and release the connection once the iterable is depleted.

```ts
import {Pool} from 'pg';

const pool = new Pool(/* connection config */);

const q = new QueryIterablePool(pool);

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

(async function () {
    for await(const u of i) {
        console.log(u); // output each row
    }
})();
```

[pg-query-stream]:https://www.npmjs.com/package/pg-query-stream
[Pool]:https://node-postgres.com/apis/pool
