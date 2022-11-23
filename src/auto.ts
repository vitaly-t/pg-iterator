import {IClientLike, IPoolLike, IQueryStreamConfig} from './types';
import {QueryIterablePool} from './from-pool';
import {QueryIterableClient} from './from-client';
import {QueryIterable} from './base';

/**
 * Automatically determines and instantiates the right driver.
 */
export function createQueryIterable<T>(driver: IPoolLike | IClientLike, config?: IQueryStreamConfig): QueryIterable<T> {
    if (typeof driver['release'] === 'function') {
        return new QueryIterableClient(driver as IClientLike, config);
    }
    if (typeof driver['Client'] === 'function') {
        return new QueryIterablePool(driver as IPoolLike, config);
    }
    throw new TypeError(`Invalid driver specified: ${JSON.stringify(driver)}`);
}
