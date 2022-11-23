import {QueryIterable} from './base';
import {IQueryStreamConfig} from './types';
import QueryStream from 'pg-query-stream';
import {IClientLike, IPoolLike} from './drivers';

/**
 * Wraps a pg.Pool object, to automatically manage the connection,
 * execute queries against it, and produce strongly-typed AsyncIterable-s.
 */
export class QueryIterablePool<T> extends QueryIterable<T> {

    constructor(private pool: IPoolLike, private config?: IQueryStreamConfig) {
        super();
    }

    query(text: string, values?: any[]): AsyncIterable<T> {
        const {pool, config} = this;
        const qs = new QueryStream(text, values, config);
        this.attachStream(qs);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        let client: IClientLike;
        qs.once('end', () => {
            this.emit('end');
            client.release();
        });
        qs.once('error', (err) => {
            this.emit('error', err);
            client.release();
        });
        return {
            [Symbol.asyncIterator](): AsyncIterator<T> {
                return {
                    next(): Promise<IteratorResult<T>> {
                        return client ? i.next() : pool.connect().then(c => {
                            client = c;
                            client.query(qs);
                            return i.next();
                        });
                    }
                };
            }
        };
    }
}
