import QueryStream from 'pg-query-stream';

export interface IClientLike {
    query<T>(qs: QueryStream): QueryStream;

    release();
}

export interface IPoolLike {
    connect(): Promise<IClientLike>;
}
