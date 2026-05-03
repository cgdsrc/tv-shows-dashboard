import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchShows, fetchShowDetail, searchShows, fetchSeasonEpisodes } from '@/services/tvmazeApi'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
    })
}

function errorResponse(status: number) {
    return Promise.resolve({
        ok: false,
        status,
        json: () => Promise.resolve({}),
    })
}

describe('tvmazeApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('fetchShows', () => {
        it('fetches shows from the correct URL with the given page', async () => {
            mockFetch.mockReturnValue(jsonResponse([{ id: 1 }]))
            await fetchShows(2)
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/shows?page=2',
                { signal: undefined },
            )
        })

        it('returns shows and hasMore: true on success', async () => {
            const shows = [{ id: 1, name: 'Test' }]
            mockFetch.mockReturnValue(jsonResponse(shows))
            const result = await fetchShows(0)
            expect(result).toEqual({ shows, hasMore: true })
        })

        it('returns empty shows and hasMore: false on 404', async () => {
            mockFetch.mockReturnValue(errorResponse(404))
            const result = await fetchShows(999)
            expect(result).toEqual({ shows: [], hasMore: false })
        })

        it('throws on non-404 error responses', async () => {
            mockFetch.mockReturnValue(errorResponse(500))
            await expect(fetchShows(0)).rejects.toThrow('Failed to fetch shows (page 0)')
        })

        it('passes the abort signal to fetch', async () => {
            const controller = new AbortController()
            mockFetch.mockReturnValue(jsonResponse([]))
            await fetchShows(0, controller.signal)
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                { signal: controller.signal },
            )
        })

        it('defaults to page 0 when no page is given', async () => {
            mockFetch.mockReturnValue(jsonResponse([]))
            await fetchShows()
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/shows?page=0',
                { signal: undefined },
            )
        })
    })

    describe('fetchShowDetail', () => {
        it('fetches from the correct URL with embeds', async () => {
            mockFetch.mockReturnValue(jsonResponse({ id: 42 }))
            await fetchShowDetail(42)
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/shows/42?embed[]=cast&embed[]=seasons',
                { signal: undefined },
            )
        })

        it('returns the show detail data', async () => {
            const detail = { id: 42, name: 'Rick and Morty' }
            mockFetch.mockReturnValue(jsonResponse(detail))
            const result = await fetchShowDetail(42)
            expect(result).toEqual(detail)
        })

        it('throws on error response', async () => {
            mockFetch.mockReturnValue(errorResponse(500))
            await expect(fetchShowDetail(42)).rejects.toThrow('Failed to fetch show 42')
        })
    })

    describe('searchShows', () => {
        it('fetches from the correct URL with encoded query', async () => {
            mockFetch.mockReturnValue(jsonResponse([]))
            await searchShows('rick and morty')
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/search/shows?q=rick%20and%20morty',
                { signal: undefined },
            )
        })

        it('returns search results', async () => {
            const results = [{ score: 1, show: { id: 1 } }]
            mockFetch.mockReturnValue(jsonResponse(results))
            const result = await searchShows('test')
            expect(result).toEqual(results)
        })

        it('throws on error response', async () => {
            mockFetch.mockReturnValue(errorResponse(500))
            await expect(searchShows('test')).rejects.toThrow('Search failed for "test"')
        })

        it('encodes special characters in the query', async () => {
            mockFetch.mockReturnValue(jsonResponse([]))
            await searchShows('test&foo=bar')
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/search/shows?q=test%26foo%3Dbar',
                { signal: undefined },
            )
        })
    })

    describe('fetchSeasonEpisodes', () => {
        it('fetches from the correct URL', async () => {
            mockFetch.mockReturnValue(jsonResponse([]))
            await fetchSeasonEpisodes(5)
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.tvmaze.com/seasons/5/episodes',
                { signal: undefined },
            )
        })

        it('returns episodes', async () => {
            const episodes = [{ id: 1, name: 'Pilot' }]
            mockFetch.mockReturnValue(jsonResponse(episodes))
            const result = await fetchSeasonEpisodes(5)
            expect(result).toEqual(episodes)
        })

        it('throws on error response', async () => {
            mockFetch.mockReturnValue(errorResponse(500))
            await expect(fetchSeasonEpisodes(5)).rejects.toThrow(
                'Failed to fetch episodes for season 5',
            )
        })
    })
})
