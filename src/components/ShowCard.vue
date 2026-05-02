<script setup lang="ts">
import type { Show } from "@/types/show";

defineProps<{
  show: Show;
}>();

function yearFromDate(date: string | null) {
  return date ? new Date(date).getFullYear() : null;
}
</script>

<template>
  <router-link
    :to="`/show/${show.id}`"
    class="show-card"
    :aria-label="show.name"
  >
    <div class="show-card__poster">
      <img
        v-if="show.image?.medium"
        :src="show.image.medium"
        :alt="show.name"
        loading="lazy"
      />
      <div v-else class="show-card__no-image">
        <span>{{ show.name.charAt(0) }}</span>
      </div>
      <!-- Hover info overlay -->
      <div class="show-card__info">
        <h3 class="show-card__info-title">{{ show.name }}</h3>
        <div class="show-card__info-meta">
          <span v-if="show.rating.average" class="show-card__info-rating"
            >★ {{ show.rating.average }}</span
          >
          <span v-if="yearFromDate(show.premiered)">{{
            yearFromDate(show.premiered)
          }}</span>
          <span v-if="show.runtime">{{ show.runtime }} min</span>
        </div>
        <div v-if="show.genres.length" class="show-card__info-genres">
          <span v-for="genre in show.genres.slice(0, 3)" :key="genre">{{
            genre
          }}</span>
        </div>
      </div>
    </div>
    <p class="show-card__title">{{ show.name }}</p>
  </router-link>
</template>

<style scoped>
.show-card {
  flex-shrink: 0;
  width: var(--card-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.show-card__poster {
  position: relative;
  width: var(--card-width);
  height: var(--card-height);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  transform-origin: center bottom;
}

.show-card:hover .show-card__poster {
  transform: scale(1.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.show-card__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.show-card__no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
}

.show-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.6) 70%,
    transparent 100%
  );
  transform: translateY(100%);
  transition: transform 0.25s ease;
}

.show-card:hover .show-card__info {
  transform: translateY(0);
}

.show-card__info-title {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.show-card__info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.show-card__info-meta span:not(:last-child)::after {
  content: "·";
  margin-left: 6px;
  color: rgba(255, 255, 255, 0.4);
}

.show-card__info-rating {
  color: var(--color-rating) !important;
  font-weight: 600;
}

.show-card__info-genres {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.show-card__info-genres span {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.75);
}

.show-card__title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast);
}

.show-card:hover .show-card__title {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .show-card {
    --card-width: 140px;
    --card-height: 210px;
  }

  .show-card__info {
    display: none;
  }

  .show-card:hover .show-card__poster {
    transform: none;
    box-shadow: var(--shadow-card);
  }
}
</style>
