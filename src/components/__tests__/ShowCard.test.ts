import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import ShowCard from '@/components/ShowCard.vue'
import type { Show } from '@/types/show'

function makeShow(overrides: Partial<Show> = {}): Show {
    return {
        id: 1,
        name: 'Rick and Morty',
        genres: ['Animation', 'Comedy'],
        image: { medium: 'https://example.com/med.jpg', original: 'https://example.com/orig.jpg' },
        summary: '<p>A genius scientist and his grandson go on wild adventures.</p>',
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

function mountCard(show: Show) {
    return mount(ShowCard, {
        props: { show },
        global: {
            stubs: { RouterLink: RouterLinkStub },
        },
    })
}

describe('ShowCard', () => {
    it('renders the show name as title', () => {
        const wrapper = mountCard(makeShow())
        expect(wrapper.find('.show-card__title').text()).toBe('Rick and Morty')
    })

    it('links to the correct show detail page', () => {
        const wrapper = mountCard(makeShow({ id: 42 }))
        const link = wrapper.findComponent(RouterLinkStub)
        expect(link.props('to')).toBe('/show/42')
    })

    it('renders the poster image when available', () => {
        const wrapper = mountCard(makeShow())
        const img = wrapper.find('.show-card__poster img')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('https://example.com/med.jpg')
    })

    it('shows the first character of the name when no image', () => {
        const wrapper = mountCard(makeShow({ image: null }))
        expect(wrapper.find('.show-card__no-image').exists()).toBe(true)
        expect(wrapper.find('.show-card__no-image span').text()).toBe('R')
    })

    it('displays the rating in the hover overlay', () => {
        const wrapper = mountCard(makeShow({ rating: { average: 8.5 } }))
        expect(wrapper.find('.show-card__info-rating').text()).toContain('8.5')
    })

    it('does not show rating when average is null', () => {
        const wrapper = mountCard(makeShow({ rating: { average: null } }))
        expect(wrapper.find('.show-card__info-rating').exists()).toBe(false)
    })

    it('displays the premiere year', () => {
        const wrapper = mountCard(makeShow({ premiered: '2015-06-12' }))
        expect(wrapper.find('.show-card__info-meta').text()).toContain('2015')
    })

    it('does not display year when premiered is null', () => {
        const wrapper = mountCard(makeShow({ premiered: null }))
        // Check that there's no year-like number in the meta (aside from rating/runtime)
        const meta = wrapper.find('.show-card__info-meta')
        expect(meta.text()).not.toMatch(/\b(19|20)\d{2}\b/)
    })

    it('displays runtime when available', () => {
        const wrapper = mountCard(makeShow({ runtime: 60 }))
        expect(wrapper.find('.show-card__info-meta').text()).toContain('60 min')
    })

    it('does not display runtime when null', () => {
        const wrapper = mountCard(makeShow({ runtime: null }))
        expect(wrapper.find('.show-card__info-meta').text()).not.toContain('min')
    })

    it('renders up to 3 genres in the overlay', () => {
        const wrapper = mountCard(makeShow({ genres: ['Drama', 'Crime', 'Thriller', 'Action'] }))
        const genreSpans = wrapper.findAll('.show-card__info-genres span')
        expect(genreSpans).toHaveLength(3)
    })

    it('sets aria-label to the show name', () => {
        const wrapper = mountCard(makeShow({ name: 'The Wire' }))
        const link = wrapper.findComponent(RouterLinkStub)
        expect(link.attributes('aria-label')).toBe('The Wire')
    })

    it('uses lazy loading for the poster image', () => {
        const wrapper = mountCard(makeShow())
        const img = wrapper.find('.show-card__poster img')
        expect(img.attributes('loading')).toBe('lazy')
    })
})
