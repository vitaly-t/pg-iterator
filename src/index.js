"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_pool_1 = __importDefault(require("pg-pool"));
const disconnected_1 = require("./disconnected");
const cn = {
    database: 'pg-promise-demo',
    user: 'postgres',
    allowExitOnIdle: true
};
const pool = new pg_pool_1.default(cn);
(async function () {
    const q = new disconnected_1.QueryIterable(pool);
    for await (const a of q.query('SELECT * FROM users')) {
        console.log(a);
    }
    console.log('fields:', q.fields);
})();
