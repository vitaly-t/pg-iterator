export interface IQueryStreamConfig {
    highWaterMark?: number // control over buffer memory
    rowMode?: 'array' // to stream rows as arrays
    types?: any // Types instance
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
