<template>
  <table class="overview">
    <slot name="caption"></slot>
    <template v-if="zaken.length > 0">
      <thead>
        <tr>
          <th>Zaaknummer</th>
          <th>Aanvrager</th>
          <th>Zaaktype</th>
          <th>Status</th>
          <th>Behandelaar</th>
          <th>Indiendatum</th>
          <th class="row-link-header">Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="zaak in zaken" :key="zaak.id" class="row-link">
          <th scope="row">{{ zaak.identificatie }}</th>
          <td class="wrap">
            <span v-if="zaak.embedded?.rollen">
              <span
                v-if="
                  zaak.embedded?.rollen[0]?.betrokkeneType ===
                  'natuurlijk_persoon'
                "
              >
                {{
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                    ?.voornamen &&
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.acternaam
                    ? `${zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.voornamen} ${zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.voorvoegselActernaam} ${zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.acternaam}`
                    : zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                        ?.inpBsn || zaak.aanvrager
                }}
              </span>
              <span
                v-if="
                  zaak.embedded?.rollen[0]?.betrokkeneType ===
                  'niet_natuurlijk_persoon'
                "
              >
                {{
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                    ?.statuaireNaam ||
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.innNnpId ||
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                    ?.annIdentificatie ||
                  zaak.aanvrager
                }}
              </span>
              <span
                v-if="
                  zaak.embedded?.rollen[0]?.betrokkeneType ===
                  'organisatorische_eenheid'
                "
                >{{
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.naam ||
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                    ?.identificatie ||
                  zaak.aanvrager
                }}
              </span>
              <span
                v-if="zaak.embedded?.rollen[0]?.betrokkeneType === 'vestiging'"
                >{{
                  zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.handelsnaam
                    .length >= 1
                    ? zaak.embedded?.rollen[0]?.betrokkeneIdentificatie?.handelsnaam.map(
                        (naam) => naam
                      )
                    : zaak.embedded?.rollen[0]?.betrokkeneIdentificatie
                        ?.kvkNummer || zaak.aanvrager
                }}
              </span>
            </span>
            <span v-if="!zaak.embedded?.rollen">{{ zaak.aanvrager }} </span>
          </td>
          <td class="wrap">{{ zaak.zaaktypeOmschrijving }}</td>
          <td class="wrap">{{ zaak.status }}</td>
          <td>{{ zaak.behandelaar }}</td>
          <td>
            <time-or-onbekend :date="zaak.startdatum" />
          </td>
          <td class="link">
            <router-link
              :to="`/zaken/${zaak.id}`"
              :title="`Details ${zaak.identificatie}`"
            ></router-link>
          </td>
        </tr>
      </tbody>
    </template>
  </table>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import type { ZaakDetails } from "./types";
import type { Vraag } from "@/stores/contactmoment";
import TimeOrOnbekend from "./components/TimeOrOnbekend.vue";

defineProps({
  zaken: { type: Array as PropType<ZaakDetails[]>, required: true },
  vraag: { type: Object as PropType<Vraag | undefined>, required: true },
});
</script>
