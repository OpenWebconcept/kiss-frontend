<template>
  <login-overlay>
    <template #default="{ onLogout }">
      <header
        :class="{ contactmomentLoopt: contactmomentStore.contactmomentLoopt }"
      >
        <global-search class="search-bar" v-if="route.meta.showSearch" />
        <a
          :href="logoutUrl"
          @click="onLogout"
          @keydown.enter="onLogout"
          class="log-out"
          >Uitloggen</a
        >
        <nav v-if="route.meta.showNav">
          <ul>
            <li>
              <router-link :to="{ name: 'home' }">
                <span>Nieuws en werkinstructies</span>

                <!-- Temporarily disabled due to Featured logic not working in Buren KISS -->
                <!-- <span
                  v-if="
                    featuredWerkberichtenCount.success &&
                    featuredWerkberichtenCount.data > 0
                  "
                  class="featured-indicator"
                  >{{
                    featuredWerkberichtenCount.data < 10
                      ? featuredWerkberichtenCount.data
                      : "9+"
                  }}</span
                > -->
              </router-link>
            </li>

            <li v-if="contactmomentStore.contactmomentLoopt">
              <router-link :to="{ name: 'personen' }"
                ><span>Personen</span></router-link
              >
            </li>

            <li v-if="contactmomentStore.contactmomentLoopt">
              <router-link :to="{ name: 'bedrijven' }"
                ><span>Bedrijven</span></router-link
              >
            </li>

            <li v-if="contactmomentStore.contactmomentLoopt">
              <router-link :to="{ name: 'zaken' }"
                ><span>Zaken</span></router-link
              >
            </li>

            <li>
              <router-link :to="{ name: 'links' }"
                ><span>Links</span></router-link
              >
            </li>

            <li>
              <router-link :to="{ name: 'contactmomenten-historie' }"
                ><span>Contactmomenten historie</span></router-link
              >
            </li>
          </ul>
        </nav>
      </header>
    </template>
  </login-overlay>
</template>

<script lang="ts" setup>
import { useFeaturedWerkberichtenCount } from "@/features/werkbericht";
import { useContactmomentStore } from "@/stores/contactmoment";
import { useRoute } from "vue-router";
import { LoginOverlay, logoutUrl } from "../features/login";
import GlobalSearch from "../features/search/GlobalSearch.vue";

const route = useRoute();
const contactmomentStore = useContactmomentStore();

const featuredWerkberichtenCount = useFeaturedWerkberichtenCount();
</script>

<style lang="scss" scoped>
header {
  background-color: var(--color-primary);
  display: grid;
  grid-template-areas:
    "bar logout"
    "results results"
    "expand expand"
    "nav nav";
  grid-template-columns: auto auto;
  align-items: center;

  .log-out {
    grid-area: logout;
    color: var(--color-white);
    padding: var(--spacing-small);
    margin-left: auto;
    margin-right: var(--container-padding);
  }
}

nav ul {
  width: 100%;
  background-color: var(--color-primary);
  display: flex;
  gap: var(--spacing-default);
  padding-block: var(--spacing-small);
  list-style: none;

  li {
    margin-inline: var(--spacing-large);
  }

  a {
    display: flex;
    gap: var(--spacing-small);
    block-size: 1.8rem;
    align-items: center;
    text-decoration: none;
    color: var(--color-white);

    &.router-link-active > :first-child {
      border-bottom: 2px solid var(--color-white);
    }
  }

  .featured-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    block-size: 100%;
    inline-size: 1.8rem;
    background-color: var(--color-error);
    border-radius: calc(var(--spacing-large) / 2);
  }
}

:deep(.search-bar) {
  margin-inline-start: var(--spacing-large);
}
</style>
