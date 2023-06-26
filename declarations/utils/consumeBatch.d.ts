export type Consumedfunction<T> = () => Promise<T>;
export declare function consumeBatch<T>(promises: Consumedfunction<T>[], batchSize?: number, callBackProgress?: (index: number, total: number) => void): Promise<T[]>;
