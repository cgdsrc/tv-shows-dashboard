<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const props = defineProps<{
  options: Option[];
  modelValue: string | number | null;
  placeholder?: string;
  minWidth?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
}>();

const open = ref(false);
const container = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue);
  return found ? found.label : (props.placeholder ?? "Select");
});

function select(value: string | number) {
  emit("update:modelValue", value);
  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (container.value && !container.value.contains(e.target as Node)) {
    open.value = false;
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
  document.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside);
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div
    ref="container"
    class="cselect"
    :class="{ 'cselect--open': open }"
    :style="minWidth ? { minWidth } : {}"
  >
    <button
      type="button"
      class="cselect__trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span class="cselect__label">{{ selectedLabel }}</span>
      <svg
        class="cselect__chevron"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 4l4 4 4-4"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="dropdown">
      <ul
        v-if="open"
        class="cselect__list"
        role="listbox"
        :aria-label="placeholder ?? 'Options'"
      >
        <li
          v-for="opt in options"
          :key="opt.value"
          class="cselect__option"
          :class="{
            'cselect__option--selected': opt.value === modelValue,
            'cselect__option--disabled': opt.disabled,
          }"
          role="option"
          :aria-selected="opt.value === modelValue"
          @click="!opt.disabled && select(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.cselect {
  position: relative;
  display: inline-block;
}

.cselect__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  width: 100%;
  min-width: inherit;
}

.cselect__trigger:hover,
.cselect--open .cselect__trigger {
  border-color: var(--color-accent);
}

.cselect--open .cselect__trigger {
  box-shadow: 0 0 0 3px rgba(0, 201, 167, 0.15);
}

.cselect__label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cselect__chevron {
  flex-shrink: 0;
  color: var(--color-accent);
  transition: transform 0.2s ease;
}

.cselect--open .cselect__chevron {
  transform: rotate(180deg);
}

/* Dropdown list */
.cselect__list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  max-height: 260px;
  overflow-y: auto;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 150;
  list-style: none;
  margin: 0;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.cselect__list::-webkit-scrollbar {
  width: 4px;
}
.cselect__list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.cselect__option {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
  white-space: nowrap;
}

.cselect__option:hover:not(.cselect__option--disabled) {
  background: var(--color-bg-card-hover);
  color: var(--color-text-primary);
}

.cselect__option--selected {
  color: var(--color-accent);
  font-weight: 600;
}

.cselect__option--disabled {
  opacity: 0.4;
  cursor: default;
}

/* Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
