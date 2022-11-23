import {EventEmitter} from 'events';
import QueryStream from 'pg-query-stream';
import {IField} from './types';

/**
 * Base class for query-iterable protocol.
 *
 * Provides columns details (field descriptors) from a query stream.
 *
 * Supports the following events:
 *  - `fields`: fields information for the current query is available;
 *  - `error`: query execution threw an error;
 *  - `end`: query streaming has finished.
 */
export abstract class QueryIterable<T> extends EventEmitter {

    /**
     * Fields - column descriptors.
     *
     * Each new query resets the list, then re-populates it when you get the first row of data,
     * plus emits event `fields` at the same time, so you can access it in either way.
     */
    fields: Array<IField> = [];

    /**
     * Generic query method, to be implemented in every derived class.
     */
    abstract query(text: string, values?: any[]): AsyncIterable<T>;

    /**
     * Patches a query stream to provide column information.
     */
    protected attachStream(qs: QueryStream): void {
        this.fields.length = 0;
        const handler = qs.handleRowDescription;
        qs.handleRowDescription = (msg: { fields: IField[] }) => {
            handler(msg); // call the previous handler
            this.fields.push(...msg.fields); // clone-copy the fields
            qs.handleRowDescription = handler; // restore the handler
            this.emit('fields', this.fields); // provide notification
        }
    }
}
