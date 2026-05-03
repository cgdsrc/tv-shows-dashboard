import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'

async function mountSearchBar(query = '') {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', name: 'dashboard', component: { template: '<div />' } },
            { path: '/search', name: 'search', component: { template: '<div />' } },
        ],
    })

    if (query) {
        await router.push({ name: 'search', query: { q: query } })
    } else {
        await router.push('/')
    }
    await router.isReady()

    const wrapper = mount(SearchBar, {
        global: { plugins: [router] },
    })

    return { wrapper, router }
}

describe('SearchBar', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders an input with search placeholder', async () => {
        const { wrapper } = await mountSearchBar()
        const input = wrapper.find('input[type="search"]')
        expect(input.exists()).toBe(true)
        expect(input.attributes('placeholder')).toBe('Search shows...')
    })

    it('has an aria-label for accessibility', async () => {
        const { wrapper } = await mountSearchBar()
        expect(wrapper.find('input').attributes('aria-label')).toBe('Search TV shows')
    })

    it('initialises with the query from the route', async () => {
        const { wrapper } = await mountSearchBar('breaking')
        const input = wrapper.find('input')
        expect((input.element as HTMLInputElement).value).toBe('breaking')
    })

    it('navigates to search route after debounce when query >= 2 chars', async () => {
        const { wrapper, router } = await mountSearchBar()
        await wrapper.find('input').setValue('test')
        vi.advanceTimersByTime(300)
        await flushPromises()
        expect(router.currentRoute.value.name).toBe('search')
        expect(router.currentRoute.value.query.q).toBe('test')
    })

    it('does not navigate when query is less than 2 characters', async () => {
        const { wrapper, router } = await mountSearchBar()
        await wrapper.find('input').setValue('a')
        vi.advanceTimersByTime(300)
        await wrapper.vm.$nextTick()
        expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('navigates back to dashboard when query cleared from search page', async () => {
        const { wrapper, router } = await mountSearchBar('test')
        expect(router.currentRoute.value.name).toBe('search')
        await wrapper.find('input').setValue('')
        await flushPromises()
        expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('shows clear button when there is a query', async () => {
        const { wrapper } = await mountSearchBar('test')
        expect(wrapper.find('.search-bar__clear').exists()).toBe(true)
    })

    it('hides clear button when query is empty', async () => {
        const { wrapper } = await mountSearchBar()
        expect(wrapper.find('.search-bar__clear').exists()).toBe(false)
    })

    it('clears input and navigates to dashboard on clear button click', async () => {
        const { wrapper, router } = await mountSearchBar('test')
        await wrapper.find('.search-bar__clear').trigger('click')
        await flushPromises()
        const input = wrapper.find('input')
        expect((input.element as HTMLInputElement).value).toBe('')
        expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('debounces input — does not navigate before 300ms', async () => {
        const { wrapper, router } = await mountSearchBar()
        await wrapper.find('input').setValue('test')
        vi.advanceTimersByTime(200)
        await flushPromises()
        expect(router.currentRoute.value.name).toBe('dashboard')
        vi.advanceTimersByTime(100)
        await flushPromises()
        expect(router.currentRoute.value.name).toBe('search')
    })
})
