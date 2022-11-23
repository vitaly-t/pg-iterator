import QueryStream from 'pg-query-stream';
import {EventEmitter} from "events";

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

export interface IClient {
    query<T>(qs: QueryStream): QueryStream;

    release();
}

export interface IPool {
    connect(): Promise<IClient>;
}
