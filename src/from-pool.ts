import {QueryIterable} from './base';
import {IQueryStreamConfig} from './types';
import QueryStream from 'pg-query-stream';
import {IClientLike, IPoolLike} from './drivers';

/**
 * Wraps a pg.Pool object, to automatically manage the connection,
 * executes queries against it, and produces strongly-typed AsyncIterable-s.
 */
export class QueryIterablePool<T> extends QueryIterable<T> {

    constructor(private pool: IPoolLike, private config?: IQueryStreamConfig) {
        super();
    }

    private client: IClientLike;
    private cleanupListeners: (() => void)[] = [];

    /**
     * Forces release of the current connection.
     */
    release(): boolean {
        return this.finish(true);
    }

    /**
     * - allocates connection from the pool;
     * - runs the query;
     * - releases connection when finished.
     */
    query(text: string, values?: Array<any>): AsyncIterable<T> {
        const self = this;
        const qs = new QueryStream(text, values, self.config);
        this.attachStream(qs);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        qs.once('end', () => {
            self.finish(false);
        });
        qs.once('error', (err) => {
            self.finish(false);
        });
        qs.once('close', (err) => {
            // client called stream.destroy();
            self.finish(true);
        });
        let r; // rejection callback;

        // see issue: https://github.com/brianc/node-postgres/issues/2870
        // we use AbortController to prevent iteration lock on disconnection;
        const ctrl = new AbortController();
        const abortListener = () => {
            r && r(ctrl.signal.reason);
            self.finish(true); // lost connection
        };
        ctrl.signal.addEventListener('abort', abortListener, {once: true});
        return {
            [Symbol.asyncIterator](): AsyncIterator<T> {
                return {
                    next(): Promise<IteratorResult<T>> {
                        if (self.client) {
                            return new Promise((resolve, reject) => {
                                r = reject;
                                i.next().then(resolve, reject);
                            });
                        }
                        return self.pool.connect().then(c => {
                            function errorListener(err: any) {
                                ctrl.abort(err); // abort a stuck stream
                            }
                            self.cleanupListeners.push(() => {
                                c.removeListener('error', errorListener);
                            });
                            c.on('error', errorListener);
                            self.client = c;
                            c.query(qs);
                            return this.next();
                        });
                    }
                };
            }
        };
    }

    private finish(forced: boolean): boolean {
        const res = !!this.client;
        if (this.client) {
            for (const fn of this.cleanupListeners) {
                fn();
            }
            this.cleanupListeners.length = 0;
            this.client.release();
            this.client = null;
        }
        this.complete(forced && res);
        return res;
    }
}
