import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import { useShowStore } from '@/stores/showStore'
import type { GenreGroup } from '@/types/show'

vi.mock('@/components/GenreRow.vue', () => ({
    default: { template: '<div class="genre-row-stub" />', props: ['genre', 'shows'] },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
    default: { template: '<div class="skeleton-stub" />', props: ['type'] },
}))

const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: DashboardView }],
})

function makeGroup(genre: string): GenreGroup {
    return {
        genre,
        shows: [
            {
                id: 1,
                name: 'Show A',
                genres: [genre],
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
            },
        ],
    }
}

async function mountView() {
    const wrapper = mount(DashboardView, {
        global: { plugins: [createPinia(), router] },
    })
    await router.isReady()
    return wrapper
}

describe('DashboardView', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('calls fetchPage(0) on mount', async () => {
        const pinia = createPinia()
        setActivePinia(pinia)
        const store = useShowStore()
        store.fetchPage = vi.fn()
        const wrapper = mount(DashboardView, {
            global: { plugins: [pinia, router] },
        })
        await router.isReady()
        expect(store.fetchPage).toHaveBeenCalledWith(0, expect.any(AbortSignal))
        wrapper.unmount()
    })

    it('shows skeleton while loading with no data', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = true

        await wrapper.vm.$nextTick()
        expect(wrapper.find('.skeleton-stub').exists()).toBe(true)
        wrapper.unmount()
    })

    it('shows error message and retry button when error occurs', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.error = 'Network error'
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.dashboard__error').exists()).toBe(true)
        expect(wrapper.text()).toContain('Network error')
        expect(wrapper.find('.dashboard__retry').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders a GenreRow for each genre group', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.error = null
        store.shows = [
            {
                id: 1,
                name: 'Show A',
                genres: ['Drama', 'Thriller'],
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
            },
        ]
        await wrapper.vm.$nextTick()
        
        expect(wrapper.findAll('.genre-row-stub')).toHaveLength(2)
        wrapper.unmount()
    })

    it('shows pagination controls when genre groups are present', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.error = null
        store.shows = [
            {
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
            },
        ]
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.dashboard__pagination').exists()).toBe(true)
        wrapper.unmount()
    })

    it('disables Previous button on page 0', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.shows = [makeGroup('Drama').shows[0]]
        await wrapper.vm.$nextTick()
        const buttons = wrapper.findAll('.dashboard__page-btn')
        const prev = buttons.find((b) => b.text().includes('Previous'))
        expect(prev?.attributes('disabled')).toBeDefined()
        wrapper.unmount()
    })

    it('disables Next button when hasMore is false', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.hasMore = false
        store.shows = [makeGroup('Drama').shows[0]]
        await wrapper.vm.$nextTick()
        const buttons = wrapper.findAll('.dashboard__page-btn')
        const next = buttons.find((b) => b.text().includes('Next'))
        expect(next?.attributes('disabled')).toBeDefined()
        wrapper.unmount()
    })

    it('displays the correct page number', async () => {
        const wrapper = await mountView()
        const store = useShowStore()
        store.loading = false
        store.currentPage = 2
        store.shows = [makeGroup('Drama').shows[0]]
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.dashboard__page-info').text()).toBe('Page 3')
        wrapper.unmount()
    })
})
