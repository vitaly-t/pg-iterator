import QueryStream from 'pg-query-stream';
import { IteratorBase } from './iterator-base';
export class QueryIterableConnected extends IteratorBase {
    constructor(client, config) {
        super();
        this.client = client;
        this.config = config;
    }
    query(text, values) {
        const q = new QueryStream(text, values, this.config);
        this.attach(q);
        return this.client.query(q);
    }
}
