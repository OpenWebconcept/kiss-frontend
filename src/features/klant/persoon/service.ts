import { formatIsoDate } from "@/helpers/date";
import type {
  GeboortedatumAchternaam,
  PostcodeHuisnummer,
} from "@/helpers/validation";
import {
  fetchLoggedIn,
  throwIfNotOk,
  parseJson,
  parseWithoutPagination,
  ServiceResult,
  type ServiceData,
  enforceOneOrZero,
} from "@/services";
import { mutate } from "swrv";
import type { Ref } from "vue";
import type { Persoon } from "./types";

const personenRootUrl = window.gatewayBaseUri + "/api/brp_proxy/ingeschrevenpersonen";

type QueryParam = [string, string][];

type SearchPersoonFieldParams = {
  bsn: string;
  geboortedatumAchternaam: GeboortedatumAchternaam;
  postcodeHuisnummer: PostcodeHuisnummer;
};

export type PersoonSearchField = keyof SearchPersoonFieldParams;

type PersoonQueryParams = {
  [K in PersoonSearchField]: (
    search: SearchPersoonFieldParams[K]
  ) => QueryParam;
};

export type PersoonQuery<K extends PersoonSearchField> = {
  field: K;
  value: SearchPersoonFieldParams[K];
};

export function persoonQuery<K extends PersoonSearchField>(
  args: PersoonQuery<K>
): PersoonQuery<K> {
  return args;
}

const queryDictionary: PersoonQueryParams = {
  bsn: (search) => [["burgerservicenummer", search]],
  geboortedatumAchternaam: (search) => [
    [
      "geboorte__datum",
      formatIsoDate(search.geboortedatum),
    ],
    ["naam__geslachtsnaam", search.achternaam],
  ],
  postcodeHuisnummer: ({ postcode, huisnummer }) => [
    [
      "verblijfplaats__postcode",
      `${postcode.numbers}${postcode.digits}`,
    ],

    ["verblijfplaats__huisnummer", huisnummer],
  ],
};

function getQueryParams<K extends PersoonSearchField>(params: PersoonQuery<K>) {
  return queryDictionary[params.field](params.value) as ReturnType<
    PersoonQueryParams[K]
  >;
}

function mapPersoon(json: any): Persoon {
  const { verblijfplaats, naam, geboorte } = json ?? {};
  const { plaats, land } = geboorte ?? {};

  const {
    postcode,
    huisnummer,
    woonplaats,
    straat,
    huisletter,
    huisnummertoevoeging,
  } = verblijfplaats ?? {};

  const datum = geboorte?.datum ?? {};

  const geboortedatum =
    datum && new Date(datum.jaar, datum.maand - 1, datum.dag);

  return {
    _typeOfKlant: "persoon",
    postcode: postcode,
    huisnummer: huisnummer?.toString(),
    bsn: json?.burgerservicenummer,
    geboortedatum,
    voornaam: naam?.voornamen,
    voorvoegselAchternaam: naam?.voorvoegsel,
    achternaam: naam?.geslachtsnaam,
    geboorteplaats: plaats ?? "-",
    geboorteland: land ?? "-",
    woonplaats: woonplaats ?? "-",
    straat,
    huisletter,
    huisnummertoevoeging,
  };
}

function getPersoonSearchUrl<K extends PersoonSearchField>(
  search: PersoonQuery<K> | undefined,
  page: number | undefined
) {
  if (!search) return "";

  const url = new URL(personenRootUrl);

  getQueryParams<K>(search).forEach((tuple) => {
    url.searchParams.set(...tuple);
  });

  if (page !== undefined && page !== 1) {
    url.searchParams.set("_page", page.toString());
  }

  return url.toString();
}

function getPersoonUrlByBsn(bsn: string) {
  if (!bsn) return "";
  const url = new URL(personenRootUrl);
  url.searchParams.set("burgerservicenummer", bsn);
  return url.toString();
}

function getPersoonUniqueBsnId(bsn: string | undefined) {
  const url = getPersoonUrlByBsn(bsn ?? "");
  if (!url) return url;
  return url + "_single";
}

const searchSinglePersoon = (url: string) =>
  searchPersonen(url).then(enforceOneOrZero);

export const searchPersonen = (url: string) => {
  return fetchLoggedIn(url)
    .then(throwIfNotOk)
    .then(parseJson)
    .then((p) => parseWithoutPagination(p, mapPersoon))
    .then((p) => {
      p.page.forEach((persoon) => {
        const key = getPersoonUniqueBsnId(persoon.bsn);
        if (key) {
          mutate(key, persoon);
        }
      });
      return p;
    });
};

export function usePersoonByBsn(
  getBsn: () => string | undefined
): ServiceData<Persoon | null> {
  const getUrl = () => getPersoonUrlByBsn(getBsn() ?? "");
  return ServiceResult.fromFetcher(getUrl, searchSinglePersoon, {
    getUniqueId: () => getPersoonUniqueBsnId(getBsn()),
  });
}

type UseSearchParams<K extends PersoonSearchField> = {
  query: Ref<PersoonQuery<K> | undefined>;
  page: Ref<number | undefined>;
};

export function useSearchPersonen<K extends PersoonSearchField>({
  query,
  page,
}: UseSearchParams<K>) {
  const getUrl = () => getPersoonSearchUrl(query.value, page.value);

  return ServiceResult.fromFetcher(getUrl, searchPersonen);
}
