import { IteratorBase } from './iterator-base';
import QueryStream from "pg-query-stream";
export class QueryIterable extends IteratorBase {
    constructor(pool, config) {
        super();
        this.pool = pool;
        this.config = config;
    }
    async *query(text, values) {
        const qs = new QueryStream(text, values, this.config);
        const client = await this.pool.conect();
        for await (const a of client.query(qs)) {
            yield a;
        }
        client.release();
    }
}
