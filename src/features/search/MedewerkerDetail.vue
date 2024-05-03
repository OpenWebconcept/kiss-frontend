<template>
  <article>
    <utrecht-heading :level="headingLevel">
      {{ title }}
    </utrecht-heading>

    <section>
      <dl>
        <dt>Functie:</dt>
        <dd>{{ medewerkerRaw?.function }}</dd>
        <dt>Afdeling:</dt>
        <dd>{{ medewerkerRaw?.department }}</dd>
        <dt>Omgschrijving:</dt>
        <dd>{{ medewerkerRaw?.description }}</dd>
      </dl>
    </section>
  </article>

  <content-feedback
    :name="title"
    :url="medewerkerRaw?.url"
    :current-section="currentFeedbackSection"
  />
</template>

<script lang="ts" setup>
import { Heading as UtrechtHeading } from "@utrecht/component-library-vue";
import { ContentFeedback } from "../feedback/index";
import type { CurrentFeedbackSection } from "../feedback/types";

const props = defineProps<{
  medewerkerRaw: any;
  headingLevel: 2 | 3 | 4;
  title: string;
}>();

const currentFeedbackSection: CurrentFeedbackSection = {
  label: props.title,
  id: props.medewerkerRaw?.user,
};
</script>

<style lang="scss" scoped>
article {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: var(--spacing-large);

  h2 {
    margin-block-end: var(--spacing-large);
  }

  > :first-child {
    grid-column: span 2;
  }

  section > :first-child {
    margin-block-end: var(--spacing-large);
  }
}

dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: var(--spacing-small);
}

dt {
  font-weight: bold;
}

dd,
dt {
  line-height: normal;
}
</style>
