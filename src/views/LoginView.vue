<template>
  <div class="template">
    <utrecht-heading :level="1">Login</utrecht-heading>

    <form @submit.prevent="handleSubmit" class="form">
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

      <span class="error" v-if="errorMessage"
        >Oops something went wrong: {{ errorMessage }}</span
      >

      <utrecht-button
        type="submit"
        appearance="primary-action-button"
        :disabled="!username || !password || isLoading"
        >Login</utrecht-button
      >
    </form>
  </div>
</template>

<script lang="ts" setup>
import Cookies from "js-cookie";
import { ref } from "vue";
import {
  Heading as UtrechtHeading,
  Button as UtrechtButton,
} from "@utrecht/component-library-vue";
import router from "@/router";

const username = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  isLoading.value = true;
  errorMessage.value = "";

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

  isLoading.value = false;

  if (!response.ok) {
    const data = await response.json();
    errorMessage.value = data.message;
  }

  if (response.ok) {
    const data = await response.json();

    Cookies.set("userId", data.id);
    Cookies.set("jwt", data.jwtToken);

    router.push("/");
  }
}
</script>

<style lang="scss" scoped>
.template {
  max-width: 100vw;
}

.form {
  display: flex;
  flex-direction: column;

  button {
    width: fit-content;

    &:disabled {
      cursor: not-allowed;
    }
  }

  .error {
    color: var(--color-error);
  }
}

* {
  margin-block-end: var(--spacing-default);
}
</style>
