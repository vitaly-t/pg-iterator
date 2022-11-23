import {IClient, IPool, IQueryStreamConfig} from './types';
import {QueryIterablePool} from './from-pool';
import {QueryIterableClient} from './from-client';

/**
 * Automatically determines the type of driver, and creates the corresponding class instance.
 */
export function createQueryIterable(driver: IPool | IClient, config?: IQueryStreamConfig) {
    if (typeof driver['connect'] === 'function') {
        return new QueryIterablePool(driver as IPool, config);
    }
    return new QueryIterableClient(driver as IClient, config);
}
