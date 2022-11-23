import {IClient, IPool, IQueryStreamConfig} from './types';
import {IteratorBase} from './iterator-base';
import QueryStream from "pg-query-stream";

export class QueryIterable<T> extends IteratorBase {

    constructor(private pool: IPool, private config?: IQueryStreamConfig) {
        super();
    }

    query(text: string, values?: any[]): AsyncIterable<T> {
        const {pool, config} = this;
        const qs = new QueryStream(text, values, config);
        this.attach(qs);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        let client: IClient;
        qs.on('end', () => {
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
