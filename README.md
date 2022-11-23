# pg-iterator

TypeScript wrapper for [pg-query-stream], to produce safe, strongly-typed `AsyncIterable`-s.

### Using `Pool`

When using an existing [Pool] object, this library will automatically acquire the connection,
create `AsyncIterable` from a `query` and release the connection once the stream has depleted.

Class `QueryIterablePool` implements such functionality.

```ts
import {Pool} from 'pg';
import {QueryIterablePool} from 'pg-iterator';

const pool = new Pool(/* connection config */);

const q = new QueryIterablePool(pool); // creating our stream container

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    console.log(u); // output each row
}
```

### Using `Client`

The library can use a connected [Client] object directly, using `QueryIterableClient` class:

```ts
import {Pool, Client} from 'pg';
import {QueryIterableClient} from 'pg-iterator';

const pool = new Pool(/* connection config */);
const client: Client = await pool.connect();

const q = new QueryIterableClient(client); // creating our stream container

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    console.log(u); // output each row
}
```

### Using unknown driver

When you do not know whether the source is a [Pool] or [Client], you can use function `createQueryIterable` instead,
which will check the type at run-time, and return either `QueryIterablePool` or `QueryIterableClient`,
which share generic protocol.

[pg-query-stream]:https://www.npmjs.com/package/pg-query-stream

[Pool]:https://node-postgres.com/apis/pool

[Client]:https://node-postgres.com/apis/client
