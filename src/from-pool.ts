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

    private client: IClientLike;

    /**
     * Forces release of the current connection.
     */
    release(): boolean {
        if (this.client) {
            this.client.release();
            this.client = null;
            return true;
        }
        return false;
    }

    query(text: string, values?: Array<any>): AsyncIterable<T> {
        const self = this;
        const qs = new QueryStream(text, values, self.config);
        this.attachStream(qs);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        qs.once('end', () => {
            self.release();
        });
        qs.once('error', (err) => {
            self.release();
        });
        return {
            [Symbol.asyncIterator](): AsyncIterator<T> {
                return {
                    next(): Promise<IteratorResult<T>> {
                        return self.client ? i.next() : self.pool.connect().then(c => {
                            self.client = c;
                            c.query(qs);
                            return i.next();
                        });
                    }
                };
            }
        };
    }
}
