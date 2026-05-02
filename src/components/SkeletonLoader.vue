<script setup lang="ts">
defineProps<{
  type: "cards" | "card-grid" | "detail" | "episodes";
  count?: number;
}>();
</script>

<template>
  <template v-if="type === 'cards'">
    <div v-for="i in count ?? 4" :key="i" class="skeleton-row">
      <div class="skeleton-row__title"></div>
      <div class="skeleton-row__cards">
        <div v-for="j in 8" :key="j" class="skeleton-card"></div>
      </div>
    </div>
  </template>

  <template v-else-if="type === 'card-grid'">
    <div class="skeleton-grid">
      <div v-for="i in count ?? 12" :key="i" class="skeleton-card"></div>
    </div>
  </template>

  <template v-else-if="type === 'detail'">
    <div class="skeleton-detail">
      <div class="skeleton-detail__hero"></div>
      <div class="skeleton-detail__content">
        <div class="skeleton-detail__title"></div>
        <div class="skeleton-detail__text"></div>
        <div class="skeleton-detail__text skeleton-detail__text--short"></div>
      </div>
    </div>
  </template>

  <template v-else-if="type === 'episodes'">
    <div class="skeleton-episodes">
      <div v-for="i in count ?? 6" :key="i" class="skeleton-episode"></div>
    </div>
  </template>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.skeleton-card {
  flex-shrink: 0;
  width: var(--card-width);
  height: var(--card-height);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-row {
  margin-bottom: var(--space-2xl);
}

.skeleton-row__title {
  width: 120px;
  height: 24px;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  margin-left: var(--page-padding);
  margin-bottom: var(--space-md);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-row__cards {
  display: flex;
  gap: var(--space-md);
  padding: 0 var(--page-padding);
  overflow: hidden;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  gap: var(--space-lg);
  justify-items: center;
}

.skeleton-detail {
  min-height: 100vh;
}

.skeleton-detail__hero {
  height: 400px;
  background: var(--color-bg-secondary);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-detail__content {
  padding: var(--space-xl);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.skeleton-detail__title {
  width: 300px;
  height: 32px;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-detail__text {
  width: 100%;
  height: 16px;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-detail__text--short {
  width: 60%;
}

.skeleton-episodes {
  display: flex;
  gap: var(--space-lg);
  overflow: hidden;
  padding: var(--space-sm) var(--page-padding) var(--space-lg);
}

.skeleton-episode {
  flex-shrink: 0;
  width: 300px;
  height: 240px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  animation: pulse 1.5s ease-in-out infinite;
}

@media (max-width: 768px) {
  .skeleton-row__title {
    margin-left: var(--page-padding);
  }

  .skeleton-row__cards {
    padding: 0 var(--page-padding);
  }

  .skeleton-episode {
    width: 260px;
    height: 200px;
  }
}
</style>
