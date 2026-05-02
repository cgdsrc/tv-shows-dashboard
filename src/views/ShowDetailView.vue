<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import type { ShowDetail, Episode } from "@/types/show";
import { fetchShowDetail, fetchSeasonEpisodes } from "@/services/tvmazeApi";
import { useShowStore } from "@/stores/showStore";
import ShowCard from "@/components/ShowCard.vue";
import EpisodeCard from "@/components/EpisodeCard.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";
import CustomSelect from "@/components/CustomSelect.vue";
import HorizontalScroll from "@/components/HorizontalScroll.vue";

const route = useRoute();
const store = useShowStore();

const show = ref<ShowDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let abortController: AbortController | null = null;

const cast = computed(() => show.value?._embedded?.cast ?? []);
const seasons = computed(() => show.value?._embedded?.seasons ?? []);
const relatedShows = computed(() => {
  if (!show.value) return [];
  return store.getRelatedShows(show.value.id, show.value.genres);
});

const relatedLoading = computed(
  () => store.loading && store.shows.length === 0,
);

const selectedSeasonId = ref<number | null>(null);
const episodes = ref<Episode[]>([]);
const episodesLoading = ref(false);
let episodeAbort: AbortController | null = null;

async function loadEpisodes(seasonId: number) {
  episodeAbort?.abort();
  episodeAbort = new AbortController();
  selectedSeasonId.value = seasonId;
  episodesLoading.value = true;
  episodes.value = [];

  try {
    episodes.value = await fetchSeasonEpisodes(seasonId, episodeAbort.signal);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    episodes.value = [];
  } finally {
    episodesLoading.value = false;
  }
}

watch(seasons, (s) => {
  if (s.length > 0) {
    loadEpisodes(s[0].id);
  }
});

async function loadShow(id: number) {
  abortController?.abort();
  abortController = new AbortController();

  show.value = null;
  loading.value = true;
  error.value = null;

  try {
    show.value = await fetchShowDetail(id, abortController.signal);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    error.value = e instanceof Error ? e.message : "Failed to load show";
  } finally {
    loading.value = false;
  }
}

if (store.shows.length === 0) {
  store.fetchPage(0);
}

watch(
  () => route.params.id,
  (id) => {
    if (id) loadShow(Number(id));
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  abortController?.abort();
  episodeAbort?.abort();
});

function yearRange(show: ShowDetail) {
  const start = show.premiered ? new Date(show.premiered).getFullYear() : "?";
  const end = show.ended
    ? new Date(show.ended).getFullYear()
    : show.status === "Running"
      ? "Present"
      : "?";
  return `${start}–${end}`;
}
</script>

<template>
  <div>
    <SkeletonLoader v-if="loading" type="detail" />

    <div v-else-if="error" class="detail-error">
      <p>{{ error }}</p>
      <router-link to="/" class="detail-error__back"
        >← Back to Dashboard</router-link
      >
    </div>

    <article v-else-if="show" class="detail">
      <div class="detail__hero">
        <img
          v-if="show.image?.original"
          :src="show.image.original"
          :alt="show.name"
          class="detail__backdrop"
        />
        <div class="detail__hero-overlay"></div>

        <div class="detail__hero-content">
          <router-link to="/" class="detail__back">← Back</router-link>

          <div class="detail__header">
            <img
              v-if="show.image?.medium"
              :src="show.image.medium"
              :alt="show.name"
              class="detail__poster"
            />
            <div class="detail__meta">
              <h1 class="detail__title">{{ show.name }}</h1>
              <div class="detail__tags">
                <span v-if="show.rating.average" class="detail__rating">
                  ★ {{ show.rating.average }}
                </span>
                <span
                  v-for="genre in show.genres"
                  :key="genre"
                  class="detail__genre"
                >
                  {{ genre }}
                </span>
                <span v-if="show.runtime" class="detail__runtime"
                  >{{ show.runtime }} min</span
                >
              </div>
              <p class="detail__info">
                <span v-if="show.network">{{ show.network.name }}</span>
                <span
                  v-if="show.status"
                  class="detail__status"
                  :class="{
                    'detail__status--running': show.status === 'Running',
                  }"
                >
                  {{ show.status }}
                </span>
                <span>{{ yearRange(show) }}</span>
                <span v-if="show.language">{{ show.language }}</span>
              </p>
              <div class="detail__actions">
                <a
                  v-if="show.officialSite"
                  :href="show.officialSite"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail__link"
                >
                  Official Site ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section v-if="show.summary" class="detail__section">
        <h2 class="detail__section-title">Summary</h2>
        <div class="detail__summary" v-html="show.summary"></div>
      </section>

      <section v-if="cast.length" class="detail__section">
        <h2 class="detail__section-title">Cast</h2>
        <HorizontalScroll no-indent list-class="detail__cast-list">
          <div v-for="member in cast" :key="member.person.id" class="cast-card">
            <div class="cast-card__image">
              <img
                v-if="member.person.image?.medium"
                :src="member.person.image.medium"
                :alt="member.person.name"
                loading="lazy"
              />
              <div v-else class="cast-card__placeholder">
                {{ member.person.name.charAt(0) }}
              </div>
            </div>
            <p class="cast-card__name">{{ member.person.name }}</p>
            <p class="cast-card__character">{{ member.character.name }}</p>
          </div>
        </HorizontalScroll>
      </section>

      <!-- Episodes -->
      <section
        v-if="seasons.length"
        class="detail__section detail__section--full"
      >
        <div class="episodes-header">
          <h2 class="detail__section-title detail__section-title--padded">
            Episodes
          </h2>
          <div class="season-select">
            <CustomSelect
              :model-value="selectedSeasonId"
              :options="
                seasons.map((s) => ({
                  value: s.id,
                  label: `Season ${s.number}`,
                }))
              "
              min-width="130px"
              @update:model-value="loadEpisodes(Number($event))"
            />
          </div>
        </div>

        <SkeletonLoader v-if="episodesLoading" type="episodes" />

        <HorizontalScroll v-else list-class="episodes-list">
          <EpisodeCard v-for="ep in episodes" :key="ep.id" :episode="ep" />
        </HorizontalScroll>
      </section>

      <section
        v-if="relatedShows.length || relatedLoading"
        class="detail__section detail__section--full"
      >
        <h2 class="detail__section-title detail__section-title--padded">
          You Might Also Like
        </h2>
        <SkeletonLoader v-if="relatedLoading" type="cards" />
        <HorizontalScroll v-else list-class="detail__related-list">
          <ShowCard
            v-for="related in relatedShows"
            :key="related.id"
            :show="related"
          />
        </HorizontalScroll>
      </section>
    </article>
  </div>
</template>

<style scoped>
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.detail-error__back {
  color: var(--color-accent);
  font-weight: 500;
}

.detail__hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.detail__backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  filter: blur(2px) brightness(0.5);
}

.detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--color-bg-primary) 0%,
    rgba(24, 26, 32, 0.5) 50%,
    rgba(24, 26, 32, 0.6) 100%
  );
}

.detail__hero-content {
  position: relative;
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-xl) var(--page-padding);
}

.detail__back {
  display: inline-block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
  transition: color var(--transition-fast);
}

.detail__back:hover {
  color: var(--color-accent);
}

.detail__header {
  display: flex;
  gap: var(--space-xl);
  align-items: flex-end;
}

.detail__poster {
  width: 180px;
  height: 270px;
  object-fit: cover;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card-hover);
  flex-shrink: 0;
}

.detail__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-bottom: var(--space-sm);
}

.detail__title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1.1;
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}

.detail__rating {
  color: var(--color-rating);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.detail__genre {
  background: var(--color-bg-card);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail__runtime {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.detail__info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail__info span:not(:last-child)::after {
  content: "·";
  margin-left: var(--space-sm);
  color: var(--color-text-muted);
}

.detail__status--running {
  color: var(--color-accent);
}

.detail__actions {
  margin-top: var(--space-sm);
}

.detail__link {
  display: inline-block;
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: background var(--transition-fast);
}

.detail__link:hover {
  background: var(--color-accent-hover);
}

.detail__section {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-2xl) var(--page-padding) 0;
}

.detail__section--full {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

.detail__section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.detail__section-title--padded {
  padding-left: var(--space-3xl);
}

.detail__summary {
  color: var(--color-text-secondary);
  line-height: 1.7;
  font-size: var(--font-size-base);
}

.detail__summary :deep(b) {
  color: var(--color-text-primary);
  font-weight: 600;
}

.detail__cast-list {
  gap: var(--space-lg);
  padding: var(--space-sm) 0;
}

.cast-card {
  flex-shrink: 0;
  width: 100px;
  text-align: center;
}

.cast-card__image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto var(--space-sm);
  background: var(--color-bg-card);
}

.cast-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cast-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
}

.cast-card__name {
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cast-card__character {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.episodes-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 0 var(--page-padding) 0 0;
  margin-bottom: var(--space-lg);
}

.episodes-header .detail__section-title {
  margin-bottom: 0;
}

.season-select {
  position: relative;
}

.episodes-list {
  gap: var(--space-lg);
  padding: var(--space-sm) var(--page-padding) var(--space-lg);
}

/* Related shows */
.detail__related-list {
  gap: var(--space-md);
  padding: var(--space-sm) var(--page-padding) var(--space-xl);
}

@media (max-width: 768px) {
  .detail__hero {
    min-height: 350px;
  }

  .detail__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail__poster {
    width: 120px;
    height: 180px;
  }

  .detail__title {
    font-size: var(--font-size-xl);
  }

  .detail__section {
    padding-right: var(--page-padding);
  }

  .detail__section-title--padded {
    padding-left: var(--page-padding);
  }

  .detail__related-list {
    padding: var(--space-sm) var(--page-padding);
  }

  .episodes-header {
    padding: 0 var(--page-padding) 0 0;
  }

  .episodes-list {
    padding: var(--space-sm) var(--page-padding);
  }

  .episode-card-skeleton {
    width: 260px;
    height: 200px;
  }
}
</style>
