<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useShowStore } from "@/stores/showStore";
import SearchBar from "@/components/SearchBar.vue";
import CustomSelect from "@/components/CustomSelect.vue";

const route = useRoute();
const router = useRouter();
const store = useShowStore();

const sidebarOpen = ref(false);

const currentGenre = computed(() => {
  if (route.name !== "genre") return null;
  return decodeURIComponent(route.params.name as string);
});

const allGenres = computed(() => store.genreGroups.map((g) => g.genre).sort());

function navigateGenre(genre: string) {
  router.push(`/genre/${encodeURIComponent(genre.toLowerCase())}`);
  sidebarOpen.value = false;
}

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<template>
  <header class="header">
    <div class="header__content">
      <router-link to="/" class="header__logo">
        <span class="header__logo-icon">▶</span>
        <span class="header__logo-text">ShowVault</span>
      </router-link>

      <!-- Desktop genre select -->
      <CustomSelect
        class="header__genre-select"
        :model-value="currentGenre ?? ''"
        :options="[
          { value: '', label: 'Browse genre', disabled: true },
          ...allGenres.map((g) => ({ value: g.toLowerCase(), label: g })),
        ]"
        placeholder="Browse genre"
        min-width="150px"
        @update:model-value="(val) => val && navigateGenre(String(val))"
      />

      <SearchBar />

      <!-- Mobile hamburger -->
      <button
        class="header__burger"
        aria-label="Open menu"
        @click="sidebarOpen = true"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- Mobile sidebar overlay -->
  <Teleport to="body">
    <Transition name="sidebar">
      <div
        v-if="sidebarOpen"
        class="sidebar-overlay"
        @click.self="closeSidebar"
      >
        <nav class="sidebar" role="navigation" aria-label="Genre menu">
          <div class="sidebar__header">
            <span class="sidebar__title">Genres</span>
            <button
              class="sidebar__close"
              aria-label="Close menu"
              @click="closeSidebar"
            >
              ✕
            </button>
          </div>
          <ul class="sidebar__list">
            <li v-for="g in allGenres" :key="g">
              <button
                class="sidebar__item"
                :class="{
                  'sidebar__item--active': currentGenre === g.toLowerCase(),
                }"
                @click="navigateGenre(g)"
              >
                {{ g }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-header);
}

.header__content {
  max-width: var(--content-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0 var(--page-padding);
}

.header__logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.header__logo-icon {
  color: var(--color-accent);
  font-size: var(--font-size-xl);
}

.header__logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: -0.5px;
}

@media (max-width: 768px) {
  .header__logo-text {
    display: none;
  }
}

.header__genre-select {
  margin-left: auto;
  flex-shrink: 0;
}

.header__burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}

.header__burger span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 2px;
  transition: background var(--transition-fast);
}

.header__burger:hover span {
  background: var(--color-accent);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100%;
  background: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.sidebar__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.sidebar__close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.sidebar__close:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-card);
}

.sidebar__list {
  list-style: none;
  padding: var(--space-sm) 0;
  margin: 0;
}

.sidebar__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px var(--space-lg);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-family: inherit;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.sidebar__item:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-card);
}

.sidebar__item--active {
  color: var(--color-accent);
  font-weight: 600;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-enter-active .sidebar,
.sidebar-leave-active .sidebar {
  transition: transform 0.25s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from .sidebar,
.sidebar-leave-to .sidebar {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .header__genre-select {
    display: none;
  }

  .header__burger {
    display: flex;
  }

  .header__content {
    padding: 0 var(--space-md);
  }
}
</style>
