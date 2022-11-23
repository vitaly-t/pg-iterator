"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryIterableConnected = void 0;
const pg_query_stream_1 = __importDefault(require("pg-query-stream"));
const iterator_base_1 = require("./iterator-base");
class QueryIterableConnected extends iterator_base_1.IteratorBase {
    constructor(client, config) {
        super();
        this.client = client;
        this.config = config;
    }
    query(text, values) {
        const qs = new pg_query_stream_1.default(text, values, this.config);
        this.attach(qs);
        return this.client.query(qs);
    }
}
exports.QueryIterableConnected = QueryIterableConnected;
