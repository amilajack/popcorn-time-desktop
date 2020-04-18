// @ts-nocheck
const SENTINEL = {};

function memoizeMethod(target, name, descriptor) {
  if (descriptor.value.length > 0) {
    throw new Error(
      "@memoize decorator can only be applied to methods of zero arguments"
    );
  }
  const memoizedName = `_memoized_${name}`;
  const { value } = descriptor;
  // eslint-disable-next-line no-param-reassign
  target[memoizedName] = SENTINEL;
  return {
    ...descriptor,
    value() {
      if (this[memoizedName] === SENTINEL) {
        this[memoizedName] = value.call(this);
      }
      return this[memoizedName];
    },
  };
}

function memoizeGetter(target, name, descriptor) {
  const memoizedName = `_memoized_${name}`;
  const { get } = descriptor;
  // eslint-disable-next-line no-param-reassign
  target[memoizedName] = SENTINEL;
  return {
    ...descriptor,
    get() {
      if (this[memoizedName] === SENTINEL) {
        this[memoizedName] = get.call(this);
      }
      return this[memoizedName];
    },
  };
}

export default function memoize(target, name, descriptor) {
  if (typeof descriptor.value === "function") {
    return memoizeMethod(target, name, descriptor);
  }
  if (typeof descriptor.get === "function") {
    return memoizeGetter(target, name, descriptor);
  }
  throw new Error(
    `@memoize decorator can be applied to methods or getters, got ${String(
      descriptor.value
    )} instead`
  );
}
