/* eslint import/prefer-default-export: off */
import { Runtime } from "./MetadataProviderInterface";

/**
 * Convert runtime from minutes to hours
 */
export function parseRuntimeMinutesToObject(runtimeInMinutes: number): Runtime {
  const hours = runtimeInMinutes >= 60 ? Math.round(runtimeInMinutes / 60) : 0;
  const minutes = runtimeInMinutes % 60;

  return {
    full:
      hours > 0
        ? `${hours} ${hours > 1 ? "hours" : "hour"}${
            minutes > 0 ? ` ${minutes} minutes` : ""
          }`
        : `${minutes} minutes`,
    hours,
    minutes,
  };
}
