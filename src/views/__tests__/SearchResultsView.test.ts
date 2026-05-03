import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SearchResultsView from '@/views/SearchResultsView.vue'
import * as api from '@/services/tvmazeApi'
import type { Show } from '@/types/show'

vi.mock('@/services/tvmazeApi', () => ({
    searchShows: vi.fn(),
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
        name: 'Rick and Morty',
        genres: ['Animation', 'Comedy'],
        image: null,
        summary: null,
        rating: { average: 9.2 },
        premiered: '2013-12-02',
        ended: null,
        language: 'English',
        status: 'Running',
        officialSite: null,
        network: null,
        schedule: { time: '', days: [] },
        runtime: 47,
        ...overrides,
    }
}

async function mountWithQuery(q: string) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/search', component: SearchResultsView }],
    })
    await router.push(`/search?q=${encodeURIComponent(q)}`)
    await router.isReady()
    const wrapper = mount(SearchResultsView, { global: { plugins: [router] } })
    return wrapper
}

describe('SearchResultsView', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows a skeleton while loading results', async () => {
        vi.mocked(api.searchShows).mockReturnValue(new Promise(() => { })) // never resolves
        const wrapper = await mountWithQuery('breaking')
        // loading = true immediately after watch triggers
        expect(wrapper.find('.skeleton-stub').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders show cards after a successful search', async () => {
        vi.mocked(api.searchShows).mockResolvedValue([
            { score: 1, show: makeShow({ id: 1, name: 'Rick and Morty' }) },
            { score: 0.9, show: makeShow({ id: 2, name: 'Solar Opposites' }) },
        ])
        const wrapper = await mountWithQuery('breaking')
        await flushPromises()
        expect(wrapper.findAll('.show-card-stub')).toHaveLength(2)
        wrapper.unmount()
    })

    it('shows "no results" message when the API returns an empty array', async () => {
        vi.mocked(api.searchShows).mockResolvedValue([])
        const wrapper = await mountWithQuery('xyznotashow')
        await flushPromises()
        expect(wrapper.find('.search-view__empty').text()).toContain('No results found')
        expect(wrapper.text()).toContain('xyznotashow')
        wrapper.unmount()
    })

    it('shows an error message when the API throws', async () => {
        vi.mocked(api.searchShows).mockRejectedValue(new Error('Search failed'))
        const wrapper = await mountWithQuery('breaking')
        await flushPromises()
        expect(wrapper.find('.search-view__empty').text()).toContain('Search failed')
        wrapper.unmount()
    })

    it('does not call the API when the query is shorter than 2 characters', async () => {
        const wrapper = await mountWithQuery('a')
        await flushPromises()
        expect(api.searchShows).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('does not call the API when the query is empty', async () => {
        const wrapper = await mountWithQuery('')
        await flushPromises()
        expect(api.searchShows).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('extracts genre tags from results', async () => {
        vi.mocked(api.searchShows).mockResolvedValue([
            { score: 1, show: makeShow({ id: 1, genres: ['Drama', 'Crime'] }) },
        ])
        const wrapper = await mountWithQuery('breaking')
        await flushPromises()
        const tags = wrapper.findAll('.search-view__tag')
        const tagTexts = tags.map((t) => t.text())
        expect(tagTexts).toContain('Drama')
        expect(tagTexts).toContain('Crime')
        wrapper.unmount()
    })
})
