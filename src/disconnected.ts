import {IClient, IPool, IQueryStreamConfig} from './types';
import {IteratorBase} from './iterator-base';
import {Readable} from "stream";
import QueryStream from "pg-query-stream";

export class QueryIterable<T> extends IteratorBase {

    constructor(private pool: any, private config?: IQueryStreamConfig) {
        super();
    }

    async* query(text: string, values?: any[]) {
        const qs = new QueryStream(text, values, this.config);
        const client: IClient = await this.pool.conect();
        for await(const a of client.query(qs)) {
            yield a;
        }
        client.release();
    }

    /*
    query(text: string, values?: any[]): AsyncIterable<T> {
        const q: Readable = new QueryStream(text, values, this.config);
        let client;
        return {
            [Symbol.asyncIterator](): AsyncIterator<T> {
                return {
                    next(): Promise<IteratorResult<T>> {
                        if (client) {

                        } else {
                            return this.pool.connect().then(c => {
                                client = c;
                            }).catch(err => {

                            });
                        }
                        return Promise.resolve({value: undefined, done: true});
                    }
                };
            }
        }
    }*/
}
