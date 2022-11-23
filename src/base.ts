import QueryStream from 'pg-query-stream';
import TypedEmitter from 'emittery';
import {IField} from './types';

type QueryIterableEvents = { fields: Array<IField>, stream: QueryStream };

/**
 * Base class for query-iterable protocol.
 *
 * Provides columns details (field descriptors) from a query stream.
 *
 * Supported events:
 *  - `fields`: provides details about fields from the query;
 *  - `stream`: notifies of a new stream is created.
 */
export abstract class QueryIterable<T> extends TypedEmitter<QueryIterableEvents> {

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
    abstract query(text: string, values?: Array<any>): AsyncIterable<T>;

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
            this.emitSafe('fields', this.fields);
        }
        this.emitSafe('stream', qs);
    }

    private emitSafe<Name extends keyof QueryIterableEvents>(eventName: Name, eventData: QueryIterableEvents[Name]): void {
        this.emit(eventName, eventData).catch();
    }

}
