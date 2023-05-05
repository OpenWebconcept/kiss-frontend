<template>
  <div class="template">
    <utrecht-heading :level="1">Login</utrecht-heading>

    <form @submit.prevent="handleSubmit">
      <input
        type="text"
        v-model="username"
        class="utrecht-textbox utrecht-textbox--html-input"
      />

      <input
        type="password"
        v-model="password"
        class="utrecht-textbox utrecht-textbox--html-input"
      />

      <utrecht-button type="submit" :disabled="!username || !password"
        >Login</utrecht-button
      >
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
  Heading as UtrechtHeading,
  Button as UtrechtButton,
} from "@utrecht/component-library-vue";
import router from "@/router";

const username = ref("");
const password = ref("");

async function handleSubmit() {
  const url = `${window.gatewayBaseUri}/api/users/login`;
  const payload = { username: username.value, password: password.value };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(url, options);

  if (response.ok) {
    const data = await response.json();
    window.sessionStorage.setItem("user", data);

    router.push("/");
  }
}
</script>

<style lang="scss" scoped>
.template {
  max-width: 100vw;
}

* {
  margin-block-end: var(--spacing-default);
}
</style>
