import QueryStream from 'pg-query-stream';
import {TypedEmitter} from 'tiny-typed-emitter';
import {IField} from './types';

/**
 * Events supported by class QueryIterable.
 */
interface QueryIterableEvents {
    fields: (fields: IField[]) => void;
    stream: (stream: QueryStream) => void;
    complete: (forced: boolean) => void;
}

/**
 * Base class for query-iterable protocol.
 *
 * Provides columns details (field descriptors) from a query stream.
 *
 * Supported events:
 *  - `fields`: provides details about fields from the query;
 *  - `stream`: notifies of a new stream created.
 *  - `complete`: notifies when the current query iteration is complete (or interrupted).
 */
export abstract class QueryIterable<T> extends TypedEmitter<QueryIterableEvents> {

    /**
     * Fields - column descriptors.
     *
     * Each new query resets the list, then re-populates it when you get the first row of data,
     * plus emits event `fields` at the same time, so you can access it in either way.
     */
    readonly fields: Array<IField> = [];

    /**
     * Returns stream instance used by the last/current query.
     *
     * It is `undefined` outside of query handling, and should be used with caution.
     * A safe way to access it is by handling event `stream` instead.
     */
    get stream(): QueryStream | undefined {
        return this._stream;
    }

    /**
     * Generic query method, to be implemented in every derived class.
     */
    abstract query(text: string, values?: Array<any>): AsyncIterable<T>;

    /**
     * Forces release of the current connection, if it is possible,
     * and return indication of whether it was released.
     */
    abstract release(): boolean;

    /**
     * Patches a query stream to provide column information.
     */
    protected attachStream(qs: QueryStream): void {
        this.fields.length = 0;
        this._stream = qs;
        const handler = qs.handleRowDescription;
        qs.handleRowDescription = (msg: { fields: IField[] }) => {
            handler(msg); // call the previous handler
            this.fields.push(...msg.fields); // clone-copy the fields
            qs.handleRowDescription = handler; // restore the handler
            this.emit('fields', this.fields);
        }
        this.emit('stream', qs);
    }

    /**
     * Provides a query-completion notification.
     */
    protected complete(forced: boolean) {
        if (this.stream) {
            this.emit('complete', forced);
            this._stream = undefined;
        }
    }

    private _stream?: QueryStream;
}
