export declare function consumeBatch<T>(promises: (() => Promise<T>)[], batchSize?: number): Promise<T[]>;
