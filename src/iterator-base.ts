import QueryStream from 'pg-query-stream';
import {IField} from './types';

export class IteratorBase {

    fields: Array<IField> = [];

    protected attach(qs: QueryStream) {
        const handler = qs.handleRowDescription;
        this.fields.length = 0;
        qs.handleRowDescription = (msg: { fields: IField[] }) => {
            handler(msg);
            this.fields.push(...msg.fields);
        }
    }
}
