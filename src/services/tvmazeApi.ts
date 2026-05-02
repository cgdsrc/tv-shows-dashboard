import type { Show, ShowDetail, SearchResult, Episode } from '@/types/show'

const BASE_URL = 'https://api.tvmaze.com'

export async function fetchShows(
    page = 0,
    signal?: AbortSignal
): Promise<{ shows: Show[]; hasMore: boolean }> {
    const response = await fetch(`${BASE_URL}/shows?page=${page}`, { signal })
    if (response.status === 404) return { shows: [], hasMore: false }
    if (!response.ok) throw new Error(`Failed to fetch shows (page ${page})`)
    const shows: Show[] = await response.json()
    return { shows, hasMore: true }
}

export async function fetchShowDetail(
    id: number,
    signal?: AbortSignal
): Promise<ShowDetail> {
    const url = `${BASE_URL}/shows/${id}?embed[]=cast&embed[]=seasons`
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`Failed to fetch show ${id}`)
    return response.json()
}

export async function searchShows(
    query: string,
    signal?: AbortSignal
): Promise<SearchResult[]> {
    const response = await fetch(
        `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`,
        { signal }
    )
    if (!response.ok) throw new Error(`Search failed for "${query}"`)
    return response.json()
}

export async function fetchSeasonEpisodes(
    seasonId: number,
    signal?: AbortSignal
): Promise<Episode[]> {
    const response = await fetch(`${BASE_URL}/seasons/${seasonId}/episodes`, {
        signal,
    })
    if (!response.ok)
        throw new Error(`Failed to fetch episodes for season ${seasonId}`)
    return response.json()
}
