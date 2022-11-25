import QueryStream from 'pg-query-stream';
import {IQueryStreamConfig} from './types';
import {QueryIterable} from './base';
import {IClientLike} from './drivers';

/**
 * Wraps a pg.Client object, to execute queries against it,
 * and produce strongly-typed AsyncIterable-s.
 */
export class QueryIterableClient<T> extends QueryIterable<T> {
    constructor(private client: IClientLike, private config?: IQueryStreamConfig) {
        super();
    }

    /**
     * Connection release here is always declined,
     * because we use an external connection here.
     */
    release(): boolean {
        return this.finish(true);
    }

    /**
     * Runs a query against specified Client object.
     */
    query(text: string, values?: Array<any>): AsyncIterable<T> {
        const self = this;
        const qs = new QueryStream(text, values, this.config);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        qs.once('end', () => {
            self.finish(false);
        });
        qs.once('error', (err) => {
            self.finish(false);
        });
        qs.once('close', (err) => {
            self.finish(false);
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
        this.client.on('error', err => {
            ctrl.abort(err); // abort a stuck stream
        });
        this.attachStream(qs);
        return {
            [Symbol.asyncIterator](): AsyncIterator<T> {
                let started;
                return {
                    next(): Promise<IteratorResult<T>> {
                        if (!started) {
                            self.client.query(qs);
                            started = true;
                        }
                        return new Promise((resolve, reject) => {
                            r = reject;
                            i.next().then(resolve, reject);
                        });
                    }
                };
            }
        };
    }

    private finish(forced: boolean): boolean {
        const res = !!this.client;
        if (this.client) {
            this.client.release();
            this.client = null;
        }
        this.complete(forced && res);
        return res;
    }

}
