<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

defineProps<{
  listClass?: string;
  noIndent?: boolean;
}>();

const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

function updateScrollState() {
  const el = scrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
}

onMounted(() => nextTick(updateScrollState));

function scroll(direction: "left" | "right") {
  const el = scrollContainer.value;
  if (!el) return;
  const amount = el.clientWidth * 0.75;
  el.scrollBy({
    left: direction === "left" ? -amount : amount,
    behavior: "smooth",
  });
}
</script>

<template>
  <div class="h-scroll">
    <button
      v-show="canScrollLeft"
      class="h-scroll__arrow h-scroll__arrow--left"
      aria-label="Scroll left"
      @click="scroll('left')"
    >
      ‹
    </button>
    <div
      ref="scrollContainer"
      class="h-scroll__list"
      :class="[
        listClass,
        canScrollLeft ? 'h-scroll__list--scrolled' : '',
        noIndent ? 'h-scroll__list--no-indent' : '',
      ]"
      @scroll="updateScrollState"
    >
      <slot />
    </div>
    <button
      v-show="canScrollRight"
      class="h-scroll__arrow h-scroll__arrow--right"
      aria-label="Scroll right"
      @click="scroll('right')"
    >
      ›
    </button>
  </div>
</template>

<style scoped>
.h-scroll {
  position: relative;
}

.h-scroll__list {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  gap: var(--space-md);
  padding-left: var(--space-3xl);
  transition: padding-left 0.3s ease;
}

.h-scroll__list--scrolled {
  padding-left: 0;
}

.h-scroll__list--no-indent {
  padding-left: 0;
}

.h-scroll__list::-webkit-scrollbar {
  display: none;
}

.h-scroll__arrow {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 48px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  opacity: 0;
  transition: opacity var(--transition-normal);
  cursor: pointer;
}

.h-scroll:hover .h-scroll__arrow {
  opacity: 1;
}

.h-scroll__arrow--left {
  left: 0;
  background: linear-gradient(
    to right,
    var(--color-bg-primary) 50%,
    transparent
  );
  padding-right: var(--space-md);
}

.h-scroll__arrow--right {
  right: 0;
  background: linear-gradient(
    to left,
    var(--color-bg-primary) 50%,
    transparent
  );
  padding-left: var(--space-md);
}

.h-scroll__arrow:hover {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .h-scroll__arrow {
    display: none;
  }

  .h-scroll__list {
    padding-left: var(--page-padding);
  }

  .h-scroll__list--no-indent {
    padding-left: 0;
  }
}
</style>
