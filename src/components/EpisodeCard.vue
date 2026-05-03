<script setup lang="ts">
import type { Episode } from "@/types/show";

defineProps<{
  episode: Episode;
}>();

function stripHtml(html: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}
</script>

<template>
  <div class="episode-card">
    <div class="episode-card__visual">
      <img
        v-if="episode.image?.medium"
        :src="episode.image.medium"
        :alt="episode.name"
        class="episode-card__bg"
        loading="lazy"
      />
      <div class="episode-card__gradient"></div>
      <div class="episode-card__overlay">
        <span class="episode-card__tag">
          S{{ episode.season }}: E{{ episode.number }}
        </span>
        <h3 class="episode-card__title">{{ episode.name }}</h3>
        <span v-if="episode.airdate" class="episode-card__date">
          {{
            new Date(episode.airdate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          }}
        </span>
        <p v-if="episode.summary" class="episode-card__summary">
          {{ stripHtml(episode.summary).slice(0, 100) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.episode-card {
  flex-shrink: 0;
  width: 300px;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform var(--transition-fast);
}

.episode-card:hover {
  transform: translateY(-2px);
}

.episode-card__visual {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.episode-card__bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.episode-card:hover .episode-card__bg {
  transform: scale(1.05);
}

.episode-card__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.45) 45%,
    transparent 100%
  );
  pointer-events: none;
}

.episode-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
}

.episode-card__tag {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.episode-card__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.episode-card__date {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-top: 2px;
}

.episode-card__summary {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .episode-card {
    width: 260px;
  }

  .episode-card__visual {
    height: 200px;
  }
}
</style>
