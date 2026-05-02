<script setup lang="ts">
import type { Show } from "@/types/show";
import ShowCard from "@/components/ShowCard.vue";
import HorizontalScroll from "@/components/HorizontalScroll.vue";

defineProps<{
  genre: string;
  shows: Show[];
}>();
</script>

<template>
  <section class="genre-row">
    <div class="genre-row__header">
      <h2 class="genre-row__title">{{ genre }}</h2>
      <router-link
        :to="`/genre/${encodeURIComponent(genre.toLowerCase())}`"
        class="genre-row__see-more"
      >
        See more ›
      </router-link>
    </div>
    <HorizontalScroll list-class="genre-row__list">
      <ShowCard v-for="show in shows" :key="show.id" :show="show" />
    </HorizontalScroll>
  </section>
</template>

<style scoped>
.genre-row {
  margin-bottom: var(--space-2xl);
}

.genre-row__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-md);
  padding-left: var(--space-3xl);
  margin-bottom: var(--space-md);
}

.genre-row__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.genre-row__see-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  transition: color var(--transition-fast);
  white-space: nowrap;
}

.genre-row__see-more:hover {
  color: var(--color-accent);
}

.genre-row__list {
  gap: var(--space-md);
  padding: var(--space-sm) var(--page-padding);
}

@media (max-width: 768px) {
  .genre-row__header {
    padding-left: var(--page-padding);
  }

  .genre-row__list {
    padding: var(--space-sm) var(--page-padding);
  }
}
</style>
