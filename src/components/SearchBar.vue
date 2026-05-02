<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const query = ref((route.query.q as string) || "");

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  const trimmed = value.trim();
  if (trimmed.length < 2) {
    if (route.name === "search") {
      router.push({ name: "dashboard" });
    }
    return;
  }

  debounceTimer = setTimeout(() => {
    router.push({ name: "search", query: { q: trimmed } });
  }, 300);
});

watch(
  () => route.query.q,
  (q) => {
    if (!q) query.value = "";
    else query.value = q as string;
  },
);

function clear() {
  query.value = "";
  if (route.name === "search") {
    router.push({ name: "dashboard" });
  }
}
</script>

<template>
  <div class="search-bar">
    <div class="search-bar__input-wrapper">
      <svg
        class="search-bar__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="query"
        type="search"
        class="search-bar__input"
        placeholder="Search shows..."
        aria-label="Search TV shows"
      />
      <button
        v-if="query"
        class="search-bar__clear"
        aria-label="Clear search"
        @click="clear"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 400px;
}

.search-bar__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-sm) var(--space-md);
  transition: border-color var(--transition-fast);
}

.search-bar__input-wrapper:focus-within {
  border-color: var(--color-accent);
}

.search-bar__icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  min-width: 0;
}

.search-bar__input::placeholder {
  color: var(--color-text-muted);
}

.search-bar__input::-webkit-search-cancel-button {
  display: none;
}

.search-bar__clear {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding: 2px 4px;
  transition: color var(--transition-fast);
}

.search-bar__clear:hover {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .search-bar {
    max-width: none;
  }
}
</style>
