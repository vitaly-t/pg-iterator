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
        this.complete(true);
        return false;
    }

    /**
     * Runs a query against specified Client object.
     */
    query(text: string, values?: Array<any>): AsyncIterable<T> {
        const qs = new QueryStream(text, values, this.config);
        qs.once('end', () => {
            this.complete(false);
        });
        qs.once('error', (err) => {
            this.complete(false);
        });
        this.attachStream(qs);
        return this.client.query(qs);
    }
}
