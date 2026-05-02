<template>
  <div class="not-found">
    <h1 class="not-found__title">404</h1>
    <p class="not-found__text">Page not found</p>
    <router-link to="/" class="not-found__link"
      >← Back to Dashboard</router-link
    >
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--space-md);
  padding: var(--space-3xl);
  text-align: center;
}

.not-found__title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-text-muted);
  line-height: 1;
}

.not-found__text {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.not-found__link {
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}

.not-found__link:hover {
  background: var(--color-accent-hover);
}
</style>
