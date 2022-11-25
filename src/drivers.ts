import QueryStream from 'pg-query-stream';
import {EventEmitter} from "events";

export interface IClientLike extends EventEmitter {
    query(qs: QueryStream): QueryStream;

    release();
}

export interface IPoolLike extends EventEmitter {
    connect(): Promise<IClientLike>;
}
