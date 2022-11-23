import {IClientLike, IPoolLike, IQueryStreamConfig} from './types';
import {QueryIterablePool} from './from-pool';
import {QueryIterableClient} from './from-client';
import {QueryIterable} from './base';

/**
 * Automatically determines and instantiates the right driver.
 */
export function createQueryIterable<T>(driver: IPoolLike | IClientLike, config?: IQueryStreamConfig): QueryIterable<T> {
    if (typeof driver['Client'] === 'function') {
        return new QueryIterablePool<T>(driver as IPoolLike, config);
    }
    if (typeof driver['release'] === 'function') {
        return new QueryIterableClient<T>(driver as IClientLike, config);
    }
    throw new TypeError(`Invalid driver specified: ${JSON.stringify(driver)}`);
}
