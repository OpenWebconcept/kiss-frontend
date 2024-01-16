import type { Paginated } from "./pagination";
import _ from "lodash"

export async function parsePagination<T>(
  json: unknown,
  map: (jObj: unknown) => T
): Promise<Paginated<Awaited<T>>> {
  const { results, limit, total, page, pages } = json as {
    [key: string]: unknown;
  };
  
  if (
    results === "" || _.isEmpty(results)
  )
    throw new Error(
      "Empty Results"
    );

  if (
    !Array.isArray(results) ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof page !== "number" ||
    typeof pages !== "number"
  )
    throw new Error(
      "unexpected in gateway json. expected pagination: " + JSON.stringify(json)
    );

  // just in case the mapper is async, we wrap the result in a Promise
  const promises = results.map((x) => Promise.resolve(map(x)));

  return {
    page: await Promise.all(promises),
    pageNumber: page,
    pageSize: limit,
    totalPages: pages,
    totalRecords: total,
  };
}

export async function parseWithoutPagination<T>(
  json: unknown,
  map: (jObj: unknown) => T
): Promise<Paginated<Awaited<T>>> {
  const { _embedded } = json as {
    [key: string]: any;
  };

  if (
    _embedded === "" || _.isEmpty(_embedded)
  )
    throw new Error(
      "Empty Results"
    );

  if (
    !Array.isArray(_embedded?.ingeschrevenpersonen)

  )
    throw new Error(
      "unexpected in gateway json. expected pagination: " + JSON.stringify(json)
    );

  // just in case the mapper is async, we wrap the result in a Promise
  const promises = _embedded?.ingeschrevenpersonen.map((x: any) => Promise.resolve(map(x)));

  return {
    page: await Promise.all(promises),
    pageNumber: 1,
    pageSize: promises.length,
    totalPages: 1,
    totalRecords: promises.length,
  };
}

//date format helper: 2005-12-30UTC01:02:03
export const getFormattedUtcDate = () => {
  const formatDateTimeElement = (x: number) => ("0" + x).slice(-2);

  const now = new Date();

  return `${now.getFullYear()}-${formatDateTimeElement(
    now.getMonth() + 1
  )}-${formatDateTimeElement(now.getDate())}UTC${formatDateTimeElement(
    now.getUTCHours()
  )}:${formatDateTimeElement(now.getUTCMinutes())}:${formatDateTimeElement(
    now.getSeconds()
  )}`;
};
