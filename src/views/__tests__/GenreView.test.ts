import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import GenreView from '@/views/GenreView.vue'
import * as api from '@/services/tvmazeApi'
import type { Show } from '@/types/show'

vi.mock('@/services/tvmazeApi', () => ({
    fetchShows: vi.fn(),
}))

vi.mock('@/components/ShowCard.vue', () => ({
    default: { template: '<div class="show-card-stub" />', props: ['show'] },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
    default: { template: '<div class="skeleton-stub" />', props: ['type'] },
}))

function makeShow(overrides: Partial<Show> = {}): Show {
    return {
        id: 1,
        name: 'Show A',
        genres: ['Drama'],
        image: null,
        summary: null,
        rating: { average: 8 },
        premiered: '2020-01-01',
        ended: null,
        language: 'English',
        status: 'Running',
        officialSite: null,
        network: null,
        schedule: { time: '', days: [] },
        runtime: 60,
        ...overrides,
    }
}

async function mountWithGenre(genre: string) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/genre/:name', component: GenreView }],
    })
    await router.push(`/genre/${encodeURIComponent(genre)}`)
    await router.isReady()
    const wrapper = mount(GenreView, {
        global: { plugins: [createPinia(), router] },
    })
    return wrapper
}

describe('GenreView', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        vi.stubGlobal('IntersectionObserver', class {
            observe() { }
            unobserve() { }
            disconnect() { }
        })
    })

    it('calls fetchShows on mount', async () => {
        vi.mocked(api.fetchShows).mockResolvedValue({ shows: [], hasMore: false })
        const wrapper = await mountWithGenre('drama')
        await flushPromises()
        expect(api.fetchShows).toHaveBeenCalledWith(0, expect.anything())
        wrapper.unmount()
    })

    it('shows skeleton while the first page is loading', async () => {
        vi.mocked(api.fetchShows).mockReturnValue(new Promise(() => { })) // never resolves
        const wrapper = await mountWithGenre('drama')
        expect(wrapper.find('.skeleton-stub').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders show cards that match the genre', async () => {
        vi.mocked(api.fetchShows).mockResolvedValue({
            shows: [
                makeShow({ id: 1, genres: ['Drama'] }),
                makeShow({ id: 2, genres: ['Drama'] }),
                makeShow({ id: 3, genres: ['Comedy'] }), 
            ],
            hasMore: false,
        })
        const wrapper = await mountWithGenre('drama')
        await flushPromises()
        expect(wrapper.findAll('.show-card-stub')).toHaveLength(2)
        wrapper.unmount()
    })

    it('shows the genre name capitalised in the heading', async () => {
        vi.mocked(api.fetchShows).mockResolvedValue({
            shows: [makeShow({ id: 1, genres: ['Science-Fiction'] })],
            hasMore: false,
        })
        const wrapper = await mountWithGenre('science-fiction')
        await flushPromises()
        expect(wrapper.find('h1').text()).toContain('Science-Fiction')
        wrapper.unmount()
    })

    it('shows an empty state message when no shows match the genre', async () => {
        vi.mocked(api.fetchShows).mockResolvedValue({
            shows: [makeShow({ id: 1, genres: ['Comedy'] })],
            hasMore: false,
        })
        const wrapper = await mountWithGenre('horror')
        await flushPromises()
        expect(wrapper.findAll('.show-card-stub')).toHaveLength(0)
        expect(wrapper.find('.genre-view__empty').exists()).toBe(true)
        wrapper.unmount()
    })

    it('resets and re-fetches when the genre route param changes', async () => {
        vi.mocked(api.fetchShows).mockResolvedValue({
            shows: [
                makeShow({ id: 1, genres: ['Drama'] }),
                makeShow({ id: 2, genres: ['Comedy'] }),
            ],
            hasMore: false,
        })
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/genre/:name', component: GenreView }],
        })
        await router.push('/genre/drama')
        await router.isReady()
        const wrapper = mount(GenreView, {
            global: { plugins: [createPinia(), router] },
        })
        await flushPromises()
        expect(wrapper.findAll('.show-card-stub')).toHaveLength(1)

        vi.mocked(api.fetchShows).mockResolvedValue({
            shows: [makeShow({ id: 2, genres: ['Comedy'] })],
            hasMore: false,
        })
        await router.push('/genre/comedy')
        await flushPromises()
        expect(wrapper.findAll('.show-card-stub')).toHaveLength(1)
        wrapper.unmount()
    })
})
