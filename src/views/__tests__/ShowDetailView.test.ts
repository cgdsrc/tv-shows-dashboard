import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ShowDetailView from '@/views/ShowDetailView.vue'
import * as api from '@/services/tvmazeApi'
import type { ShowDetail, Episode } from '@/types/show'

vi.mock('@/services/tvmazeApi', () => ({
    fetchShowDetail: vi.fn(),
    fetchSeasonEpisodes: vi.fn(),
}))

vi.mock('@/components/ShowCard.vue', () => ({
    default: { template: '<div class="show-card-stub" />', props: ['show'] },
}))
vi.mock('@/components/EpisodeCard.vue', () => ({
    default: { template: '<div class="episode-card-stub" />', props: ['episode'] },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
    default: { template: '<div class="skeleton-stub" />', props: ['type'] },
}))
vi.mock('@/components/CustomSelect.vue', () => ({
    default: {
        template: '<select class="custom-select-stub" />',
        props: ['modelValue', 'options', 'minWidth'],
        emits: ['update:modelValue'],
    },
}))
vi.mock('@/components/HorizontalScroll.vue', () => ({
    default: {
        template: '<div class="h-scroll-stub"><slot /></div>',
        props: ['listClass'],
    },
}))

function makeShowDetail(overrides: Partial<ShowDetail> = {}): ShowDetail {
    return {
        id: 42,
        name: 'Breaking Bad',
        genres: ['Drama', 'Crime'],
        image: {
            medium: 'https://example.com/med.jpg',
            original: 'https://example.com/orig.jpg',
        },
        summary: '<p>A teacher becomes a drug lord.</p>',
        rating: { average: 9.5 },
        premiered: '2008-01-20',
        ended: '2013-09-29',
        language: 'English',
        status: 'Ended',
        officialSite: 'https://amc.com/breaking-bad',
        network: { name: 'AMC', country: { name: 'United States' } },
        schedule: { time: '22:00', days: ['Sunday'] },
        runtime: 47,
        _embedded: {
            cast: [
                {
                    person: {
                        id: 1,
                        name: 'Bryan Cranston',
                        image: { medium: 'https://example.com/bc.jpg', original: '' },
                    },
                    character: { id: 10, name: 'Walter White', image: null },
                },
            ],
            seasons: [
                {
                    id: 1,
                    number: 1,
                    name: '',
                    episodeOrder: 7,
                    premiereDate: '2008-01-20',
                    endDate: '2008-03-09',
                    image: null,
                },
            ],
        },
        ...overrides,
    }
}

function makeEpisode(id: number): Episode {
    return {
        id,
        name: `Episode ${id}`,
        season: 1,
        number: id,
        airdate: '2008-01-20',
        runtime: 47,
        summary: '<p>Summary</p>',
        image: null,
    }
}

async function mountWithId(id: number) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/show/:id', component: ShowDetailView }],
    })
    await router.push(`/show/${id}`)
    await router.isReady()
    const wrapper = mount(ShowDetailView, {
        global: { plugins: [createPinia(), router] },
    })
    return wrapper
}

describe('ShowDetailView', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('shows skeleton while the show is loading', async () => {
        vi.mocked(api.fetchShowDetail).mockReturnValue(new Promise(() => { }))
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        expect(wrapper.find('.skeleton-stub').exists()).toBe(true)
        wrapper.unmount()
    })

    it('calls fetchShowDetail with the route id', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(api.fetchShowDetail).toHaveBeenCalledWith(42, expect.any(AbortSignal))
        wrapper.unmount()
    })

    it('renders the show title', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(wrapper.find('.detail__title').text()).toBe('Breaking Bad')
        wrapper.unmount()
    })

    it('renders the rating', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(wrapper.find('.detail__rating').text()).toContain('9.5')
        wrapper.unmount()
    })

    it('renders a badge for each genre', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(
            makeShowDetail({ genres: ['Drama', 'Crime', 'Thriller'] }),
        )
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(wrapper.findAll('.detail__genre')).toHaveLength(3)
        wrapper.unmount()
    })

    it('renders cast members inside the scroll container', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(wrapper.find('.cast-card').exists()).toBe(true)
        expect(wrapper.find('.cast-card__name').text()).toBe('Bryan Cranston')
        wrapper.unmount()
    })

    it('auto-loads episodes for the first season', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([
            makeEpisode(1),
            makeEpisode(2),
        ])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(api.fetchSeasonEpisodes).toHaveBeenCalledWith(
            1,
            expect.any(AbortSignal),
        )
        expect(wrapper.findAll('.episode-card-stub')).toHaveLength(2)
        wrapper.unmount()
    })

    it('shows the error state when the fetch fails', async () => {
        vi.mocked(api.fetchShowDetail).mockRejectedValue(new Error('Not found'))
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(999)
        await flushPromises()
        expect(wrapper.find('.detail-error').exists()).toBe(true)
        expect(wrapper.find('.detail-error').text()).toContain('Not found')
        wrapper.unmount()
    })

    it('shows the official site link when available', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(makeShowDetail())
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        const link = wrapper.find('.detail__link')
        expect(link.exists()).toBe(true)
        expect(link.attributes('href')).toBe('https://amc.com/breaking-bad')
        wrapper.unmount()
    })

    it('does not render the official site link when officialSite is null', async () => {
        vi.mocked(api.fetchShowDetail).mockResolvedValue(
            makeShowDetail({ officialSite: null }),
        )
        vi.mocked(api.fetchSeasonEpisodes).mockResolvedValue([])
        const wrapper = await mountWithId(42)
        await flushPromises()
        expect(wrapper.find('.detail__link').exists()).toBe(false)
        wrapper.unmount()
    })
})
