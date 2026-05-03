import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EpisodeCard from '@/components/EpisodeCard.vue'
import type { Episode } from '@/types/show'

function makeEpisode(overrides: Partial<Episode> = {}): Episode {
    return {
        id: 1,
        name: 'Pilot',
        season: 1,
        number: 1,
        airdate: '2013-12-02',
        runtime: 22,
        image: { medium: 'https://example.com/ep.jpg', original: '' },
        summary: '<p>Rick moves in with the Smiths and takes Morty on an adventure.</p>',
        ...overrides,
    }
}

function mountCard(episode: Episode) {
    return mount(EpisodeCard, { props: { episode } })
}

describe('EpisodeCard', () => {
    it('displays the season and episode number tag', () => {
        const wrapper = mountCard(makeEpisode({ season: 2, number: 5 }))
        expect(wrapper.find('.episode-card__tag').text()).toContain('S2')
        expect(wrapper.find('.episode-card__tag').text()).toContain('E5')
    })

    it('renders the episode name', () => {
        const wrapper = mountCard(makeEpisode({ name: 'Lawnmower Dog' }))
        expect(wrapper.find('.episode-card__title').text()).toBe('Lawnmower Dog')
    })

    it('renders the episode image when available', () => {
        const wrapper = mountCard(makeEpisode())
        const img = wrapper.find('.episode-card__bg')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('https://example.com/ep.jpg')
    })

    it('does not render an image when image is null', () => {
        const wrapper = mountCard(makeEpisode({ image: null }))
        expect(wrapper.find('.episode-card__bg').exists()).toBe(false)
    })

    it('formats and displays the air date', () => {
        const wrapper = mountCard(makeEpisode({ airdate: '2013-12-02' }))
        expect(wrapper.find('.episode-card__date').text()).toContain('Dec')
        expect(wrapper.find('.episode-card__date').text()).toContain('2013')
    })

    it('does not show date when airdate is null', () => {
        const wrapper = mountCard(makeEpisode({ airdate: null }))
        expect(wrapper.find('.episode-card__date').exists()).toBe(false)
    })

    it('strips HTML tags from the summary', () => {
        const wrapper = mountCard(makeEpisode({ summary: '<p>Hello <b>world</b></p>' }))
        const text = wrapper.find('.episode-card__summary').text()
        expect(text).toContain('Hello world')
        expect(text).not.toContain('<p>')
        expect(text).not.toContain('<b>')
    })

    it('does not show ellipsis for short summaries', () => {
        const wrapper = mountCard(makeEpisode({ summary: '<p>Short</p>' }))
        const text = wrapper.find('.episode-card__summary').text()
        expect(text).toBe('Short')
        expect(text).not.toContain('...')
    })

    it('does not show summary when null', () => {
        const wrapper = mountCard(makeEpisode({ summary: null }))
        expect(wrapper.find('.episode-card__summary').exists()).toBe(false)
    })

    it('uses lazy loading for the image', () => {
        const wrapper = mountCard(makeEpisode())
        expect(wrapper.find('.episode-card__bg').attributes('loading')).toBe('lazy')
    })
})
