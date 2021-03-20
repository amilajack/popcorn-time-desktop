/* eslint-disable */
import { PctCacheValue, PctCache } from "../torrents/Cache";

function getNewFunction(
  name: string,
  originalFunction: (...args: any[]) => Promise<PctCacheValue>
) {
  return async function decorator(this: CacheFunction, ...args: any[]) {
    const { cache } = this;
    const cacheKey = JSON.stringify({ name, args });

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const returnedValue = await originalFunction.apply(this, args);
    console.log(cache.dump(), cacheKey);
    cache.set(cacheKey, returnedValue);

    return returnedValue;
  };
}
export default function cacheDecorator() {
  return function cacheFn(target, name, descriptor) {
    if (descriptor.value != null)
      descriptor.value = getNewFunction(name, descriptor.value);
    else if (descriptor.get != null)
      descriptor.get = getNewFunction(name, descriptor.get);
    else
      throw new Error(
        "Only put a Memoize decorator on a method or get accessor."
      );
  };
}

interface CacheFunction {
  cache: PctCache;
}
