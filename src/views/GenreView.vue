<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { fetchShows } from "@/services/tvmazeApi";
import type { Show } from "@/types/show";
import ShowCard from "@/components/ShowCard.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

const route = useRoute();
let abortController: AbortController | null = null;

const rawParam = computed(() =>
  decodeURIComponent(route.params.name as string),
);
const genreName = computed(() =>
  rawParam.value.replace(/\b\w/g, (c) => c.toUpperCase()),
);

const shows = ref<Show[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const loadError = ref(false);
let nextPage = 0;
let consecutiveEmpty = 0;
const MAX_CONSECUTIVE_EMPTY = 3;

function resetLocalState() {
  shows.value = [];
  loading.value = false;
  loadingMore.value = false;
  hasMore.value = true;
  loadError.value = false;
  nextPage = 0;
  consecutiveEmpty = 0;
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;

  const isFirst = shows.value.length === 0;
  if (isFirst) loading.value = true;
  loadingMore.value = true;

  const genre = rawParam.value.toLowerCase();

  try {
    const result = await fetchShows(nextPage, abortController?.signal);
    if (!result.hasMore && result.shows.length === 0) {
      hasMore.value = false;
    } else {
      const matching = result.shows.filter((s) =>
        s.genres.some((g) => g.toLowerCase() === genre),
      );
      if (matching.length > 0) {
        consecutiveEmpty = 0;
        const existingIds = new Set(shows.value.map((s) => s.id));
        const unique = matching.filter((s) => !existingIds.has(s.id));
        shows.value = [...shows.value, ...unique].sort(
          (a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0),
        );
      } else {
        consecutiveEmpty++;
        if (consecutiveEmpty >= MAX_CONSECUTIVE_EMPTY) {
          hasMore.value = false;
        }
      }
      nextPage++;
      if (!result.hasMore) {
        hasMore.value = false;
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    loadError.value = true;
  } finally {
    loading.value = false;
    loadingMore.value = false;
    if (sentinelVisible.value && hasMore.value && !loadError.value) {
      loadMore();
    }
  }
}

watch(rawParam, () => {
  resetLocalState();
  loadMore();
});

function retryLoad() {
  loadError.value = false;
  loadMore();
}

const sentinel = ref<HTMLElement | null>(null);
const sentinelVisible = ref(false);
let observer: IntersectionObserver | null = null;

watch(sentinel, (el) => {
  observer?.disconnect();
  if (!el) return;
  observer = new IntersectionObserver(
    (entries) => {
      sentinelVisible.value = entries[0].isIntersecting;
      if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
        loadMore();
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(el);
});

const scrolled = ref(false);

function onScroll() {
  scrolled.value = window.scrollY > 60;
}

onMounted(() => {
  abortController = new AbortController();
  loadMore();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  abortController?.abort();
  observer?.disconnect();
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="genre-view">
    <div
      class="genre-view__sticky"
      :class="{ 'genre-view__sticky--scrolled': scrolled }"
    >
      <div class="genre-view__sticky-inner">
        <router-link to="/" class="genre-view__back">← Back</router-link>
        <span
          class="genre-view__sticky-title"
          :class="{ 'genre-view__sticky-title--visible': scrolled }"
        >
          {{ genreName }}
        </span>
      </div>
    </div>

    <div class="genre-view__header">
      <h1 class="genre-view__title">{{ genreName }}</h1>
      <p class="genre-view__count">{{ shows.length }} shows</p>
    </div>

    <SkeletonLoader
      v-if="loading && shows.length === 0"
      type="card-grid"
      :count="18"
    />

    <template v-else-if="shows.length">
      <div class="genre-view__grid">
        <ShowCard v-for="show in shows" :key="show.id" :show="show" />
      </div>

      <div ref="sentinel" class="genre-view__sentinel">
        <div v-if="loadError" class="genre-view__error">
          <p>Failed to load more shows.</p>
          <button class="genre-view__retry" @click="retryLoad">
            Try Again
          </button>
        </div>
        <div v-else-if="loadingMore" class="genre-view__loading">
          <span class="genre-view__spinner"></span>
          Loading more shows...
        </div>
        <p v-else-if="!hasMore" class="genre-view__end">
          That's all for {{ genreName }}
        </p>
      </div>
    </template>

    <div v-else class="genre-view__empty">
      <p>No shows found for "{{ genreName }}"</p>
    </div>
  </div>
</template>

<style scoped>
.genre-view {
  padding: var(--space-lg) var(--page-padding) var(--space-3xl);
  max-width: var(--content-max-width);
  margin: 0 auto;

  padding-top: calc(var(--space-lg) + 48px);
}

.genre-view__sticky {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  z-index: 90;
  height: 48px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid transparent;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    backdrop-filter 0.25s ease;
}

.genre-view__sticky--scrolled {
  background: rgba(30, 32, 48, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: var(--color-border);
}

.genre-view__sticky-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0 var(--page-padding);
}

.genre-view__back {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: color var(--transition-fast);
}

.genre-view__back:hover {
  color: var(--color-accent);
}

.genre-view__sticky-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.genre-view__sticky-title--visible {
  opacity: 1;
  transform: translateY(0);
}

.genre-view__header {
  margin-bottom: var(--space-xl);
}

.genre-view__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.genre-view__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.genre-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  gap: var(--space-lg);
  justify-items: center;
}

.genre-view__sentinel {
  padding: var(--space-2xl) 0;
  text-align: center;
}

.genre-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.genre-view__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.genre-view__end {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.genre-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.genre-view__retry {
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}

.genre-view__retry:hover {
  background: var(--color-accent-hover);
}

.genre-view__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .genre-view__title {
    font-size: var(--font-size-xl);
  }

  .genre-view__grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
