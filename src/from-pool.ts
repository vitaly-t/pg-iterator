import {QueryIterable} from './base';
import {IClient, IPool, IQueryStreamConfig} from './types';
import QueryStream from 'pg-query-stream';

export class QueryIterablePool<T> extends QueryIterable<T> {

    constructor(private pool: IPool, private config?: IQueryStreamConfig) {
        super();
    }

    query(text: string, values?: any[]): AsyncIterable<T> {
        const {pool, config} = this;
        const qs = new QueryStream(text, values, config);
        this.attachStream(qs);
        const i: AsyncIterator<T> = qs[Symbol.asyncIterator]();
        let client: IClient;
        qs.on('end', () => {
            client.release();
        });
        qs.on('error', () => {
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
