export class IteratorBase {
    constructor() {
        this.fields = [];
    }
    attach(qs) {
        const handler = qs.handleRowDescription;
        this.fields.length = 0;
        qs.handleRowDescription = (msg) => {
            handler(msg);
            this.fields.push(...msg.fields);
        };
    }
}
