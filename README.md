# pg-iterator

TypeScript wrapper for [pg-query-stream], which adds the following:

* Produces `AsyncIterable`, to process data row-by-row, with `for await` or a library of your choice, like [RxJs] etc.
* The library is strongly-typed throughout: you can optionally specify row entity types for your queries. 
* Automatically connects [Pool] on the first-row iteration (disconnects on last) - no need connecting outside streaming.
* Unifies error handling for queries and connections - initial, interrupted or lost / broken.
* Offers one protocol for working with [Client] or [Pool] objects.

## Installation

```
$ npm i pg-iterator
```

## Usage

You have the flexibility of using this module with [Pool] or [Client], or a dynamically-determined type,
via [createQueryIterable] function.

Each of the interfaces - [QueryIterablePool], [QueryIterableClient] or [createQueryIterable] supports
strong-type parametrization, for typed row iteration.

See [complete examples].

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

// the onus is on you when to release the client and the pool when done:
// client.release(), pool.end()
```

### Using dynamic driver

When you do not know whether the source is a [Pool] or [Client], you can use function [createQueryIterable] instead,
which will check the type at run-time, and return either [QueryIterablePool] or [QueryIterableClient],
which share generic [QueryIterable] protocol.

### Fields information

In every usage scenario, you end up with [QueryIterable] base interface, which exposes information about columns.

* You can either access it after reading the very first row:

```ts
const q = new QueryIterablePool(pool);

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

// q.fields is empty at this point

for await(const u of i) {
    const {fields} = q; // fields details are available at this point

    console.log(u); // output each row
}
```

* Or you can use notification event `fields` instead:

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

### Events

Base interface [QueryIterable] can emit the following events:

* `fields` - fields details, as explained above;
* `stream` - notification of a new stream created;
* `complete` - notification of completing the current query.

### Error handling

This library manages connection and runs queries inside the same row iteration, the only thing that can throw errors:

```ts
const q = new QueryIterablePool(pool);

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

try {
    for await(const u of i) {
        console.log(u); // output each row
    }
} catch (err) {
    // all connection and query errors arrive here
}
```

### Integration

Most libraries that are based on [node-postgres] expose [Pool] and [Client] interfaces.

For example, [pg-promise] exposes [Pool] via [Database.$pool], so you can do:

```ts
const q = new QueryIterablePool(db.$pool); // creating Pool container from Database object
```

And in terms of data consumption, since the data here is `AsyncIterable`, there are many libraries
that can consume and process it.

* Example with [RxJs]:

```ts
import {from, take} from 'rxjs';

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

from(i).pipe(take(10)).subscribe(row => {
    console.log(row); // up to 10 rows
});
```

* Example with [iter-ops]:

```ts
import {pipe, take} from 'iter-ops';

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

const r = pipe(i, take(10));

for await (const a of r) {
    console.log(a); // up to 10 rows
}
```

Note that if iteration is incomplete because you interrupted the iteration loop,
or used some limiting operators (like `take` above), the connection will remain
open indefinitely. In such cases you may want to force-release the connection,
by calling method `release` of [QueryIterable] manually:

```ts
import {from, take} from 'rxjs';

const q = new QueryIterablePool(pool);

const i = q.query('SELECT * FROM users WHERE id = $1', [123]);

from(i).pipe(take(10)).subscribe({
    next(row) {
        console.log(row);
    },
    complete() {
        // since we use "take(10)" above, the iteration may be incomplete,
        // and the connection will be stuck, so we have to force-release it: 
        q.release();
    }
});
```

Alternatively, you can wrap [QueryIterable] + query into a safe `Observable` creator:

```ts
function fromQuery<T>(qi: QueryIterable<T>, text: string, params?: any[]): Observable<T> {
    return from(qi.query(text, params)).pipe(finalize(() => {
        qi.release();
    }));
}
```

See also: [complete examples].

[Database.$pool]:http://vitaly-t.github.io/pg-promise/Database.html#$pool

[node-postgres]:https://github.com/brianc/node-postgres

[pg-query-stream]:https://www.npmjs.com/package/pg-query-stream

[Pool]:https://node-postgres.com/apis/pool

[Client]:https://node-postgres.com/apis/client

[QueryIterablePool]:https://github.com/vitaly-t/pg-iterator/blob/main/src/from-pool.ts

[QueryIterableClient]:https://github.com/vitaly-t/pg-iterator/blob/main/src/from-client.ts

[createQueryIterable]:https://github.com/vitaly-t/pg-iterator/blob/main/src/auto.ts

[QueryIterable]:https://github.com/vitaly-t/pg-iterator/blob/main/src/base.ts

[RxJs]:https://github.com/ReactiveX/rxjs

[iter-ops]:https://github.com/vitaly-t/iter-ops

[pg-promise]:https://github.com/vitaly-t/pg-promise

[complete examples]:https://github.com/vitaly-t/pg-iterator/wiki/Examples