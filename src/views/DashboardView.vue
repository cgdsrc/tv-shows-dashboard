<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useShowStore } from "@/stores/showStore";
import GenreRow from "@/components/GenreRow.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

const store = useShowStore();
let abortController: AbortController | null = null;

onMounted(() => {
  abortController = new AbortController();
  store.fetchPage(0, abortController.signal);
});

onBeforeUnmount(() => {
  abortController?.abort();
});

function goNext() {
  abortController?.abort();
  abortController = new AbortController();
  window.scrollTo({ top: 0, behavior: "smooth" });
  store.nextPage(abortController.signal);
}

function goPrev() {
  abortController?.abort();
  abortController = new AbortController();
  window.scrollTo({ top: 0, behavior: "smooth" });
  store.prevPage(abortController.signal);
}
</script>

<template>
  <div class="dashboard">
    <SkeletonLoader
      v-if="store.loading && store.genreGroups.length === 0"
      type="cards"
    />

    <div
      v-else-if="store.error && store.genreGroups.length === 0"
      class="dashboard__error"
    >
      <p>{{ store.error }}</p>
      <button
        class="dashboard__retry"
        @click="store.fetchPage(store.currentPage)"
      >
        Try Again
      </button>
    </div>

    <template v-else>
      <GenreRow
        v-for="group in store.genreGroups"
        :key="group.genre"
        :genre="group.genre"
        :shows="group.shows"
      />

      <div class="dashboard__pagination">
        <button
          class="dashboard__page-btn"
          :disabled="store.currentPage === 0 || store.loading"
          aria-label="Previous page"
          @click="goPrev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-left-icon lucide-chevron-left"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span class="dashboard__page-info">
          Page {{ store.currentPage + 1 }}
        </span>

        <button
          class="dashboard__page-btn"
          :disabled="!store.hasMore || store.loading"
          aria-label="Next page"
          @click="goNext"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-right-icon lucide-chevron-right"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-3xl);
}

.dashboard__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-2xl) var(--page-padding);
}

.dashboard__page-btn {
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.dashboard__page-btn:hover:not(:disabled) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-primary);
}

.dashboard__page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dashboard__page-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 600;
  min-width: 80px;
  text-align: center;
}

.dashboard__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
  text-align: center;
}

.dashboard__retry {
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}

.dashboard__retry:hover {
  background: var(--color-accent-hover);
}
</style>
