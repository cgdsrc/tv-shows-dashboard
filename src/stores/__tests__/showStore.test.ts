import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowStore } from '@/stores/showStore'
import type { Show } from '@/types/show'

const createMockShow = (overrides: Partial<Show> = {}): Show => ({
    id: 1,
    name: 'Test Show',
    genres: ['Drama'],
    image: { medium: 'http://example.com/m.jpg', original: 'http://example.com/o.jpg' },
    summary: '<p>A test show</p>',
    rating: { average: 8.0 },
    premiered: '2020-01-01',
    ended: null,
    language: 'English',
    status: 'Running',
    officialSite: null,
    network: { name: 'HBO', country: { name: 'United States' } },
    schedule: { time: '21:00', days: ['Sunday'] },
    runtime: 60,
    ...overrides,
})

describe('showStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('starts with empty state', () => {
        const store = useShowStore()
        expect(store.shows).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.genreGroups).toEqual([])
        expect(store.currentPage).toBe(0)
        expect(store.hasMore).toBe(true)
    })

    it('groups shows by genre and sorts by rating', () => {
        const store = useShowStore()
        store.shows = [
            createMockShow({ id: 1, name: 'Low Drama', genres: ['Drama'], rating: { average: 5.0 } }),
            createMockShow({ id: 2, name: 'High Drama', genres: ['Drama'], rating: { average: 9.0 } }),
            createMockShow({ id: 3, name: 'Comedy Show', genres: ['Comedy'], rating: { average: 7.0 } }),
        ]

        expect(store.genreGroups).toHaveLength(2)

        const comedy = store.genreGroups.find((g) => g.genre === 'Comedy')
        const drama = store.genreGroups.find((g) => g.genre === 'Drama')

        expect(comedy?.shows).toHaveLength(1)
        expect(drama?.shows).toHaveLength(2)
        expect(drama?.shows[0].name).toBe('High Drama')
        expect(drama?.shows[1].name).toBe('Low Drama')
    })

    it('shows all genres regardless of count (no minimum threshold)', () => {
        const store = useShowStore()
        store.shows = [
            createMockShow({ id: 1, genres: ['Rare Genre'], rating: { average: 5.0 } }),
        ]

        expect(store.genreGroups).toHaveLength(1)
        expect(store.genreGroups[0].genre).toBe('Rare Genre')
    })

    it('places shows with null ratings last', () => {
        const store = useShowStore()
        store.shows = [
            createMockShow({ id: 1, name: 'No Rating', genres: ['Drama'], rating: { average: null } }),
            createMockShow({ id: 2, name: 'Has Rating', genres: ['Drama'], rating: { average: 6.0 } }),
        ]

        const drama = store.genreGroups.find((g) => g.genre === 'Drama')
        expect(drama?.shows[0].name).toBe('Has Rating')
        expect(drama?.shows[1].name).toBe('No Rating')
    })

    it('assigns a show to multiple genre groups', () => {
        const store = useShowStore()
        store.shows = [
            createMockShow({ id: 1, genres: ['Drama', 'Thriller'] }),
        ]

        expect(store.genreGroups).toHaveLength(2)
        expect(store.genreGroups.map((g) => g.genre).sort()).toEqual(['Drama', 'Thriller'])
    })
})
