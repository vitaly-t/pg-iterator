import QueryStream from 'pg-query-stream';
import {IClientLike, IQueryStreamConfig} from './types';
import {QueryIterable} from './base';

export class QueryIterableClient<T> extends QueryIterable<T> {
    constructor(private client: IClientLike, private config?: IQueryStreamConfig) {
        super();
    }

    query(text: string, values?: any[]): AsyncIterable<T> {
        const qs = new QueryStream(text, values, this.config);
        this.attachStream(qs);
        return this.client.query(qs);
    }
}
