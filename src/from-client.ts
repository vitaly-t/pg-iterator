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

    query(text: string, values?: any[]): AsyncIterable<T> {
        const qs = new QueryStream(text, values, this.config);
        qs.once('end', () => {
            this.emit('end');
        });
        qs.once('error', (err) => {
            this.emit('error', err);
        });
        this.attachStream(qs);
        return this.client.query(qs);
    }
}
