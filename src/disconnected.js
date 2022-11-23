"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryIterable = void 0;
const iterator_base_1 = require("./iterator-base");
const pg_query_stream_1 = __importDefault(require("pg-query-stream"));
class QueryIterable extends iterator_base_1.IteratorBase {
    constructor(pool, config) {
        super();
        this.pool = pool;
        this.config = config;
    }
    query(text, values) {
        const { pool, config } = this;
        const qs = new pg_query_stream_1.default(text, values, config);
        this.attach(qs);
        const i = qs[Symbol.asyncIterator]();
        let client;
        qs.on('end', () => {
            client.release();
        });
        return {
            [Symbol.asyncIterator]() {
                return {
                    next() {
                        return client ? i.next() : pool.connect().then(c => {
                            client = c;
                            client.query(qs);
                            return i.next();
                        });
                    }
                };
            }
        };
    }
}
exports.QueryIterable = QueryIterable;
