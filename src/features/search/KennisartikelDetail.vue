<template>
  <article>
    <utrecht-heading :level="headingLevel" class="heading">
      {{ title }}
    </utrecht-heading>
    <nav>
      <ul>
        <li
          v-for="{ isActive, label, id, setActive } in mappedSections"
          :key="id + 'nav'"
          :class="{ 'is-active': isActive }"
        >
          <span v-if="isActive">{{ label }}</span>
          <a v-else :href="`#${id}`" @click.prevent="setActive">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <section
      v-for="{ id, html, isActive, label } in mappedSections"
      :key="id + 'text'"
      :class="{ 'is-active': isActive }"
      :id="id"
    >
      <utrecht-heading :level="headingLevel + 1">{{ label }}</utrecht-heading>
      <div class="section-content" v-html="html"></div>
    </section>
  </article>

  <content-feedback
    v-if="currentFeedbackSection"
    :name="title"
    :url="kennisartikelRaw.url"
    :current-section="currentFeedbackSection"
  />
</template>
<script setup lang="ts">
import {
  sanitizeHtmlToBerichtFormat,
  unescapeHtml,
  increaseHeadings,
} from "@/helpers/html";
import { Heading as UtrechtHeading } from "@utrecht/component-library-vue";
import { nanoid } from "nanoid";
import { computed, ref, watch } from "vue";
import { ContentFeedback } from "../feedback/index";
import type { Kennisartikel } from "./types";

const knownSections = {
  specifiekeTekst: "Inleiding",
  procedureBeschrijving: "Meenemen",
  conditions: "Voorwaarden",
  bewijs: "Bewijs",
  kostenEnBetaalmethoden: "Kosten",
  uitersteTermijn: "Termijn",
  bezwaarEnBeroep: "Bezwaar",
  vereisten: "Vereisten",
  notice: "Meer informatie",
  faq: "Meer informatie",
  wtdBijGeenReactie: "Geen reactie",
  contact: "Contact",
  deskMemo: "KCC",
} as const;

const componentId = nanoid();

const props = defineProps<{
  kennisartikelRaw: any;
  title: string;
  headingLevel: 2 | 3 | 4;
}>();

function processHtml(html: string) {
  const unescapedHtml = unescapeHtml(html);
  const cleanedHtml = sanitizeHtmlToBerichtFormat(unescapedHtml);
  const htmlWithIncreasedHeadings = increaseHeadings(
    cleanedHtml,
    (props.headingLevel + 1) as any
  );
  return htmlWithIncreasedHeadings;
}

const currentSectionIndex = ref(0);

const currentFeedbackSection = computed(() => {
  const currentSection = mappedSections.value[currentSectionIndex.value];
  if (!currentSection) return undefined;
  return {
    label: currentSection.label,
    id: currentSection.key,
  };
});

const kennisartikel = computed<Record<string, string>>(() => {
  const vertalingen = props.kennisartikelRaw.embedded?.vertalingen || {};

  if (!Array.isArray(vertalingen)) return {};
  return vertalingen.find(({ taal }) => taal === "nl") || {};
});

const processedSections = computed(() => {
  const allSections = Object.entries(knownSections).map(([key, label]) => ({
    label,
    key: key,
    text: kennisartikel.value[key],
  }));

  const sectionsWithActualText = allSections.filter(({ text }) => !!text);

  const sectionsWithProcessedHtml = sectionsWithActualText.map(
    ({ label, text, key }) => {
      if (key === "notice") {
        if (sectionsWithActualText.find((item) => item.key === "faq")) {
          return false;
        }

        return {
          key: key,
          label,
          html: processHtml(text),
        };
      }

      if (key === "faq") {
        if (text.length === 0) {
          return false;
        }

        const html = text.map((item) => {
          return `<details><summary>${item.question}</summary><div class="content">${item.answer}</div></details>`;
        });

        return {
          key: key,
          label,
          html: processHtml(`${html.join("")}`),
        };
      }

      return {
        key: key,
        label,
        html: processHtml(text),
      };
    }
  );

  const index = sectionsWithProcessedHtml.indexOf(false);
  if (index > -1) {
    sectionsWithProcessedHtml.splice(index, 1);
  }

  return sectionsWithProcessedHtml;
});

// seperate this computed variable for caching purposes: making a section active doesn't trigger the reprocessing of the source html
const mappedSections = computed(() =>
  processedSections.value.map((section, index) => ({
    ...section,
    id: componentId + index,
    isActive: index === currentSectionIndex.value,
    setActive() {
      currentSectionIndex.value = index;
    },
  }))
);

watch(
  () => props.kennisartikelRaw.uuid,
  () => {
    currentSectionIndex.value = 0;
  }
);

const KENNISARTIKEL_SELECTED = "kennisartikel-selected";

const emit = defineEmits<{
  (e: typeof KENNISARTIKEL_SELECTED, artikel: Kennisartikel): void;
}>();

watch(
  processedSections,
  (s) => {
    if (!s.length) return;
    const sections = s
      .map(({ label }) => label)
      .filter((x) => x !== knownSections.specifiekeTekst);

    emit(KENNISARTIKEL_SELECTED, {
      title: props.title,
      url: props.kennisartikelRaw.url,
      sections,
    });
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
article {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-large);

  .heading {
    width: 100%;
  }
  > section {
    flex: 1;
    display: none;

    &.is-active {
      display: block;
    }

    div :deep(h3),
    div :deep(h4) {
      margin-block-start: var(--spacing-default);
    }

    :deep(ul) {
      list-style: disc;
      margin-inline-start: var(--spacing-default);
      margin-block: var(--spacing-small);

      ul {
        list-style: circle;
        margin-block: 0;
      }
    }

    :deep(td) {
      border: 1px var(--color-tertiary) solid;
      padding: var(--spacing-small);
    }

    :deep(table) {
      margin-block: var(--spacing-small);
    }

    :deep(p + p) {
      margin-block-start: var(--spacing-small);
    }
  }
}

.section-content::v-deep {
  details {
    padding: 10px;
    border-radius: 5px;
  }

  summary {
    background-color: #415a77;
    color: white;
    padding: 10px;
  }

  summary:hover {
    cursor: pointer;
  }

  summary::after {
    display: none;
  }

  .content {
    padding: 1.8rem;
    border: 1px solid #415a77;
  }
}

nav ul {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-extrasmall);

  li {
    border: 1px solid var(--color-tertiary);

    a,
    span {
      text-decoration: none;
      color: inherit;
      padding: var(--spacing-small);
      display: block;
    }
  }

  .is-active {
    background-color: var(--color-tertiary);
    color: var(--color-white);
    text-decoration: underline;
  }
}
</style>
