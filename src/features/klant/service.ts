import {
  ServiceResult,
  fetchLoggedIn,
  type Paginated,
  parsePagination,
  throwIfNotOk,
  parseJson,
  type ServiceData,
  coerceToSingle,
} from "@/services";
import { mutate } from "swrv";
import type { Ref } from "vue";
import {
  getPersoonSearchUrl,
  getPersoonUrlByBsn,
  personenRootUrl,
  searchPersonen,
} from "./brp/service";

import type { UpdateContactgegevensParams, Klant, Persoon } from "./types";

type QueryParam = [string, string][];

type FieldParams = {
  email: string;
  telefoonnummer: string;
};

export function klantSearch<K extends KlantSearchField>(
  args: KlantSearch<K>
): KlantSearch<K> {
  return args;
}

export type KlantSearchField = keyof FieldParams;

type QueryDictionary = {
  [K in KlantSearchField]: (search: FieldParams[K]) => QueryParam;
};

const queryDictionary: QueryDictionary = {
  email: (search) => [["emails.email", `%${search}%`]],
  telefoonnummer: (search) => [
    ["telefoonnummers.telefoonnummer", `%${search}%`],
  ],
};

export type KlantSearch<K extends KlantSearchField> = {
  searchField: K;
  query: FieldParams[K];
};

function getQueryParams<K extends KlantSearchField>(params: KlantSearch<K>) {
  return queryDictionary[params.searchField](params.query as any) as ReturnType<
    QueryDictionary[K]
  >;
}

type KlantSearchParameters<K extends KlantSearchField = KlantSearchField> = {
  search: Ref<KlantSearch<K> | undefined>;
  page: Ref<number | undefined>;
};

const klantRootUrl = `${window.gatewayBaseUri}/api/klanten`;

function setExtend(url: URL) {
  url.searchParams.set("extend[]", "all");
}

function getKlantSearchUrl<K extends KlantSearchField>(
  search: KlantSearch<K> | undefined,
  page: number | undefined
) {
  if (!search?.query) return "";

  const url = new URL(klantRootUrl);
  setExtend(url);
  url.searchParams.set("order[achternaam]", "asc");
  url.searchParams.set("page", page?.toString() ?? "1");

  getQueryParams(search).forEach((tuple) => {
    url.searchParams.set(...tuple);
  });

  return url.toString();
}

function mapKlant(obj: any): Klant {
  const { subjectIdentificatie, emails, telefoonnummers } = obj?.embedded ?? {};
  const { inpBsn, verblijfsadres, geboortedatum } = subjectIdentificatie ?? {};
  const { aoaHuisnummer, aoaPostcode } = verblijfsadres ?? {};

  return {
    ...obj,
    _brand: "klant",
    emails: emails ?? [],
    telefoonnummers: telefoonnummers ?? [],
    bsn: inpBsn,
    postcode: aoaPostcode,
    huisnummer: aoaHuisnummer,
    geboortedatum: geboortedatum && new Date(geboortedatum),
  };
}

function searchKlanten(url: string): Promise<Paginated<Klant>> {
  return fetchLoggedIn(url)
    .then(throwIfNotOk)
    .then(parseJson)
    .then((j) => parsePagination(j, mapKlant))
    .then((p) => {
      p.page.forEach((klant) => {
        const idUrl = getKlantIdUrl(klant.id);
        if (idUrl) {
          mutate(idUrl, klant);
        }
        const bsnUrl = getKlantBsnUrl(klant.bsn);

        if (bsnUrl) {
          mutate(bsnUrl, klant);
        }
      });
      return p;
    });
}

function getKlantIdUrl(id?: string) {
  if (!id) return "";
  const url = new URL(`${klantRootUrl}/${id}`);
  setExtend(url);
  return url.toString();
}

function getKlantBsnUrl(bsn?: string) {
  if (!bsn) return "";
  const url = new URL(klantRootUrl);
  setExtend(url);
  url.searchParams.set("subjectIdentificatie.inpBsn", bsn);
  return url.toString();
}

function fetchKlantById(url: string) {
  return fetchLoggedIn(url).then(throwIfNotOk).then(parseJson).then(mapKlant);
}

export function useKlant(id: Ref<string>) {
  return ServiceResult.fromFetcher(
    () => getKlantIdUrl(id.value),
    fetchKlantById
  );
}

function updateContactgegevens({
  id,
  telefoonnummers,
  emails,
}: UpdateContactgegevensParams): Promise<UpdateContactgegevensParams> {
  const url = klantRootUrl + "/" + id;
  return fetchLoggedIn(url + "?fields[]=klantnummer&fields[]=bronorganisatie")
    .then(throwIfNotOk)
    .then(parseJson)
    .then(({ klantnummer, bronorganisatie }) =>
      fetchLoggedIn(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefoonnummers,
          emails,
          klantnummer,
          bronorganisatie,
        }),
      })
    )
    .then(throwIfNotOk)
    .then(parseJson)
    .then(({ embedded }) => ({
      id,
      telefoonnummers: embedded?.telefoonnummers ?? [],
      emails: embedded?.emails ?? [],
    }));
}

export function useUpdateContactGegevens() {
  return ServiceResult.fromSubmitter(updateContactgegevens);
}

const searchKlantenOrPersonen = (
  url: string
): Promise<Paginated<Klant> | Paginated<Persoon>> =>
  url.includes(personenRootUrl) ? searchPersonen(url) : searchKlanten(url);

export function useUberSearch<K extends KlantSearchField>(
  params: KlantSearchParameters<K>
) {
  const getUrl = () => {
    const search = params.search.value;
    const page = params.page.value || 1;

    if (!search) return "";

    if (
      search.searchField === "telefoonnummer" ||
      search.searchField === "email"
    )
      return getKlantSearchUrl(search, page);

    return getPersoonSearchUrl(search as any, page);
  };

  return ServiceResult.fromFetcher(getUrl, searchKlantenOrPersonen);
}

export function useEnrichPersoon(
  input: Ref<Persoon | Klant>
): ServiceData<Persoon | Klant | undefined> {
  const getUrl = () => {
    const { bsn, _brand } = input.value;
    if (!bsn) return "";
    if (_brand === "persoon") return getKlantBsnUrl(bsn);
    return getPersoonUrlByBsn(bsn);
  };

  const paginated = ServiceResult.fromFetcher(getUrl, searchKlantenOrPersonen);
  return coerceToSingle(paginated);
}

export async function ensureKlant(bsn: string) {
  const bsnUrl = getKlantBsnUrl(bsn);
  if (!bsnUrl) throw new Error();

  const existing = await searchKlanten(bsnUrl);

  if (existing.page.length) {
    const first = existing.page[0];
    if (first) {
      mutate(bsnUrl, existing);
      const idUrl = getKlantIdUrl(first.id);
      mutate(idUrl, first);
      return first;
    }
  }

  const response = await fetchLoggedIn(klantRootUrl, {
    method: "POST",
    body: JSON.stringify({
      bronorganisatie: window.organisatieIds[0],
      // TODO: WAT MOET HIER IN KOMEN?
      klantnummer: "123",
      subjectIdentificatie: { inpBsn: bsn },
    }),
  });

  if (!response.ok) throw new Error();

  const json = await response.json();
  const newKlant = mapKlant(json);
  const idUrl = getKlantIdUrl(newKlant.id);

  mutate(idUrl, newKlant);

  return newKlant;
}
