<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import type { SearchResult } from "@/types/show";
import { searchShows } from "@/services/tvmazeApi";
import ShowCard from "@/components/ShowCard.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

const route = useRoute();

const results = ref<SearchResult[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let abortController: AbortController | null = null;

const query = ref((route.query.q as string) || "");

watch(
  () => route.query.q,
  async (q) => {
    const term = (q as string)?.trim();
    query.value = term || "";

    if (!term || term.length < 2) {
      results.value = [];
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    loading.value = true;
    error.value = null;

    try {
      results.value = await searchShows(term, abortController.signal);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      error.value = e instanceof Error ? e.message : "Search failed";
      results.value = [];
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => abortController?.abort());

const genres = ref<string[]>([]);
watch(results, (r) => {
  const allGenres = new Set<string>();
  r.forEach((res) => res.show.genres.forEach((g) => allGenres.add(g)));
  genres.value = Array.from(allGenres).slice(0, 8);
});
</script>

<template>
  <div class="search-view">
    <div class="search-view__header">
      <p v-if="query" class="search-view__subtitle">
        Explore titles related to:
        <span v-for="genre in genres" :key="genre" class="search-view__tag">
          {{ genre }}
        </span>
      </p>
    </div>

    <SkeletonLoader v-if="loading" type="card-grid" />

    <div v-else-if="error" class="search-view__empty">
      <p>{{ error }}</p>
    </div>

    <div
      v-else-if="query && !loading && results.length === 0"
      class="search-view__empty"
    >
      <p>No results found for "{{ query }}"</p>
    </div>

    <div v-else class="search-view__grid">
      <ShowCard
        v-for="result in results"
        :key="result.show.id"
        :show="result.show"
      />
    </div>
  </div>
</template>

<style scoped>
.search-view {
  padding: var(--space-lg) var(--page-padding) var(--space-3xl);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.search-view__header {
  margin-bottom: var(--space-xl);
}

.search-view__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
}

.search-view__tag {
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: default;
}

.search-view__tag:not(:last-child)::after {
  content: "|";
  margin-left: var(--space-sm);
  color: var(--color-text-muted);
  font-weight: 400;
}

.search-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  gap: var(--space-lg);
  justify-items: center;
}

.search-view__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .search-view__grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-md);
  }
}
</style>
