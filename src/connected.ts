import {IClient, IQueryStreamConfig} from './types';
import QueryStream from 'pg-query-stream';
import {IteratorBase} from './iterator-base';

export class QueryIterableConnected<T> extends IteratorBase {
    constructor(private client: IClient, private config?: IQueryStreamConfig) {
        super();
    }

    query(text: string, values?: any[]): AsyncIterable<T> {
        const q = new QueryStream(text, values, this.config);
        this.attach(q);
        return this.client.query(q);
    }

}
