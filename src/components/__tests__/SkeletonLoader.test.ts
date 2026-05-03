import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

describe('SkeletonLoader', () => {
    it('renders card rows for type "cards"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'cards' } })
        expect(wrapper.findAll('.skeleton-row')).toHaveLength(4) // default count
    })

    it('respects custom count for "cards"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'cards', count: 2 } })
        expect(wrapper.findAll('.skeleton-row')).toHaveLength(2)
    })

    it('renders skeleton cards inside each row', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'cards', count: 1 } })
        expect(wrapper.findAll('.skeleton-card')).toHaveLength(8) // 8 cards per row
    })

    it('renders a grid for type "card-grid"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'card-grid' } })
        expect(wrapper.find('.skeleton-grid').exists()).toBe(true)
        expect(wrapper.findAll('.skeleton-card')).toHaveLength(12) // default count
    })

    it('respects custom count for "card-grid"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'card-grid', count: 6 } })
        expect(wrapper.findAll('.skeleton-card')).toHaveLength(6)
    })

    it('renders the detail skeleton for type "detail"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'detail' } })
        expect(wrapper.find('.skeleton-detail').exists()).toBe(true)
        expect(wrapper.find('.skeleton-detail__hero').exists()).toBe(true)
        expect(wrapper.find('.skeleton-detail__title').exists()).toBe(true)
    })

    it('renders episode skeletons for type "episodes"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'episodes' } })
        expect(wrapper.find('.skeleton-episodes').exists()).toBe(true)
        expect(wrapper.findAll('.skeleton-episode')).toHaveLength(6) // default count
    })

    it('respects custom count for "episodes"', () => {
        const wrapper = mount(SkeletonLoader, { props: { type: 'episodes', count: 3 } })
        expect(wrapper.findAll('.skeleton-episode')).toHaveLength(3)
    })
})
