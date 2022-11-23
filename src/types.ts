import QueryStream from 'pg-query-stream';

export interface IQueryStreamConfig {
    batchSize?: number
    highWaterMark?: number
    rowMode?: 'array'
    types?: any
}

export interface IField {
    name: string
    dataTypeID: number
    tableID: number
    columnID: number
    dataTypeSize: number
    dataTypeModifier: number
    format: string
}

export interface IClientLike {
    query<T>(qs: QueryStream): QueryStream;

    release();
}

export interface IPoolLike {
    connect(): Promise<IClientLike>;
}
