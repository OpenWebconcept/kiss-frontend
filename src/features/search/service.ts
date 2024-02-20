import { parseValidUrl, ServiceResult, type Paginated } from "@/services";
import { fetchLoggedIn } from "@/services";
import type { Ref } from "vue";
import type { SearchResult, Source } from "./types";

const searchURL = `${window.gatewayBaseUri}/api/dit_search`;

function mapResult(object: any): SearchResult {
  const source = getSourceName(object?._self?.schema?.name);
  const jsonObject = object;
  const id = object?._id;
  const title = object?._self?.name;
  const content = object?.body_content?.raw;
  const url = parseValidUrl(object?.url?.raw);
  const self = object?.self?.raw;
  return {
    source,
    id,
    title,
    content,
    url,
    jsonObject,
    self,
  };
}

export function useGlobalSearch(
  parameters: Ref<{
    search?: string;
    page?: number;
    filters: Source[];
  }>
) {
  async function fetcher(): Promise<Paginated<SearchResult>> {
    const _searchURL = new URL(searchURL);

    if (parameters.value.search) {
      _searchURL.searchParams.append(
        "_search[skills,function,department,user,description,embedded.contact.klantnummer,embedded.contact.voornaam,embedded.contact.achternaam,upnLabel,embedded.vertalingen.productTitelDecentraal,embedded.vertalingen.specifiekeTekst,embedded.vertalingen.synonyms.synonym,embedded.bevoegdeOrganisatie.naam,embedded.verantwoordelijkeOrganisatie.naam]",
        parameters.value.search
      );
    }

    if (parameters.value.filters) {
      parameters.value.filters.forEach((filter) => {
        _searchURL.searchParams.append(
          "_self.schema.ref[]",
          getSchemaName(filter.name)
        );
      });
    }

    const r = await fetchLoggedIn(_searchURL, {
      method: "GET",
    });
    if (!r.ok) throw new Error();
    const json = await r.json();
    const { results, meta } = json ?? {};
    const {
      current: pageNumber,
      total_pages: totalPages,
      size: pageSize,
    } = meta?.page ?? {};
    const page = Array.isArray(results) ? results.map(mapResult) : [];
    return {
      page,
      pageSize,
      pageNumber,
      totalPages,
    };
  }

  function getUniqueId() {
    const { search, page, filters } = parameters.value ?? {};
    if (!search) return "";
    return `${search}|${page || 1}|${filters.sort((a, b) =>
      a.name.localeCompare(b.name)
    )}`;
  }

  return ServiceResult.fromFetcher(searchURL, fetcher, {
    getUniqueId,
  });
}

const getSourceName = (schemaName: string) => {
  switch (schemaName) {
    case "SDGProduct":
      return "Kennisartikel";
    case "MedewerkerKiss":
      return "Smoelenboek";
    default:
      return "Onbekend";
  }
};

const getSchemaName = (sourceName: string) => {
  switch (sourceName) {
    case "Kennisartikel":
      return "https://kissdevelopment.commonground.nu/kiss.sdgProduct.schema.json";
    case "Smoelenboek":
      return "https://kissdevelopment.commonground.nu/kiss.medewerker.schema.json";
    default:
      return "Onbekend";
  }
};
