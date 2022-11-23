# pg-iterator

TypeScript wrapper for [pg-query-stream], to produce safe, strongly-typed `AsyncIterable`-s.

It offers an asynchronous way to stream data, row-by-row, which you can handle either natively (via `for await`)
or an iterable library of your choice, like RxJs etc.

## Installation

```
$ npm i pg-iterator
```

## Usage

You have the flexibility of using this module with [Pool] or [Client], or a dynamically-determined type,
via [createQueryIterable] function.

Each of the interfaces - [QueryIterablePool], [QueryIterableClient] or [createQueryIterable] supports
strong-type parametrization, for typed row iteration.

### Using `Pool`

When using an existing [Pool] object, this library will automatically acquire the connection,
create `AsyncIterable` from a `query` and release the connection, once the stream has finished.

Class [QueryIterablePool] implements such functionality:

```ts
import {Pool} from 'pg';
import {QueryIterablePool} from 'pg-iterator';

const pool = new Pool(/* connection config */);

const q = new QueryIterablePool(pool); // creating our Pool container

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    console.log(u); // output each row
}
```

### Using `Client`

This library can use a connected [Client] object directly, via [QueryIterableClient] class:

```ts
import {Pool, Client} from 'pg';
import {QueryIterableClient} from 'pg-iterator';

const pool = new Pool(/* connection config */);
const client: Client = await pool.connect();

const q = new QueryIterableClient(client); // creating our Client container

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    console.log(u); // output each row
}
```

### Using unknown driver

When you do not know whether the source is a [Pool] or [Client], you can use function [createQueryIterable] instead,
which will check the type at run-time, and return either [QueryIterablePool] or [QueryIterableClient],
which share generic [QueryIterable] protocol.

### Fields information

In every usage scenario, you end up with [QueryIterable] base interface, which exposes information about columns.

* You can either access it after reading the very first row:

```ts
const q = new QueryIterablePool(pool);

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    const {fields} = q; // it is available at this point
    
    console.log(u); // output each row
}
```

* Or you can get a notification event `fields` instead:

```ts
const q = new QueryIterablePool(pool);

q.on('fields', fields => {
    // sent with complete list of fields here,
    // before the first row in the loop below
});

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

for await(const u of i) {
    console.log(u); // output each row
}
```

[pg-query-stream]:https://www.npmjs.com/package/pg-query-stream

[Pool]:https://node-postgres.com/apis/pool

[Client]:https://node-postgres.com/apis/client

[QueryIterablePool]:https://github.com/vitaly-t/pg-iterator/blob/main/src/from-pool.ts

[QueryIterableClient]:https://github.com/vitaly-t/pg-iterator/blob/main/src/from-client.ts

[createQueryIterable]:https://github.com/vitaly-t/pg-iterator/blob/main/src/auto.ts

[QueryIterable]:https://github.com/vitaly-t/pg-iterator/blob/main/src/base.ts
