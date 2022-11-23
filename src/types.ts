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
