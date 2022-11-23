import {IClient, IPool, IQueryStreamConfig} from './types';
import {QueryIterablePool} from './from-pool';
import {QueryIterableClient} from './from-client';
import {QueryIterable} from './base';

/**
 * Automatically determines and instantiates the right driver.
 */
export function createQueryIterable<T>(driver: IPool | IClient, config?: IQueryStreamConfig): QueryIterable<T> {
    if (typeof driver['connect'] === 'function') {
        return new QueryIterablePool(driver as IPool, config);
    }
    return new QueryIterableClient(driver as IClient, config);
}
