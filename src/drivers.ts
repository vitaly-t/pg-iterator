import QueryStream from 'pg-query-stream';

export interface IClientLike {
    query(qs: QueryStream): QueryStream;

    release();
}

export interface IPoolLike {
    connect(): Promise<IClientLike>;
}
