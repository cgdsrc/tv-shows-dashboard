import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Show, GenreGroup } from '@/types/show'
import { fetchShows } from '@/services/tvmazeApi'

export const useShowStore = defineStore('shows', () => {
    const shows = ref<Show[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(0)
    const hasMore = ref(true)

    const genreGroups = computed<GenreGroup[]>(() => {
        const genreMap = new Map<string, Show[]>()

        for (const show of shows.value) {
            for (const genre of show.genres) {
                if (!genreMap.has(genre)) {
                    genreMap.set(genre, [])
                }
                genreMap.get(genre)!.push(show)
            }
        }

        return Array.from(genreMap.entries())
            .map(([genre, genreShows]) => ({
                genre,
                shows: [...genreShows].sort(
                    (a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0)
                ),
            }))
            .sort((a, b) => a.genre.localeCompare(b.genre))
    })

    async function fetchPage(page: number, signal?: AbortSignal) {
        loading.value = true
        error.value = null

        try {
            const result = await fetchShows(page, signal)
            shows.value = result.shows
            currentPage.value = page
            hasMore.value = result.hasMore
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return
            error.value =
                e instanceof Error ? e.message : 'Failed to load shows'
        } finally {
            loading.value = false
        }
    }

    async function nextPage(signal?: AbortSignal) {
        if (!hasMore.value || loading.value) return
        await fetchPage(currentPage.value + 1, signal)
    }

    async function prevPage(signal?: AbortSignal) {
        if (currentPage.value <= 0 || loading.value) return
        await fetchPage(currentPage.value - 1, signal)
    }

    function getRelatedShows(showId: number, genres: string[], limit = 15): Show[] {
        const scored = new Map<number, { show: Show; score: number }>()

        for (const show of shows.value) {
            if (show.id === showId) continue
            const overlap = show.genres.filter((g) => genres.includes(g)).length
            if (overlap > 0) {
                scored.set(show.id, {
                    show,
                    score: overlap * 10 + (show.rating.average ?? 0),
                })
            }
        }

        return Array.from(scored.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((s) => s.show)
    }


    return {
        shows,
        loading,
        error,
        currentPage,
        hasMore,
        genreGroups,
        fetchPage,
        nextPage,
        prevPage,
        getRelatedShows,
    }
})
