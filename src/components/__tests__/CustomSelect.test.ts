import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomSelect from '@/components/CustomSelect.vue'

const options = [
    { value: 1, label: 'Season 1' },
    { value: 2, label: 'Season 2' },
    { value: 3, label: 'Season 3', disabled: true },
]

function mountSelect(props: Record<string, unknown> = {}) {
    return mount(CustomSelect, {
        props: {
            options,
            modelValue: null,
            placeholder: 'Pick a season',
            ...props,
        },
    })
}

describe('CustomSelect', () => {
    it('shows placeholder when no value is selected', () => {
        const wrapper = mountSelect()
        expect(wrapper.find('.cselect__label').text()).toBe('Pick a season')
    })

    it('shows the selected option label', () => {
        const wrapper = mountSelect({ modelValue: 2 })
        expect(wrapper.find('.cselect__label').text()).toBe('Season 2')
    })

    it('defaults to "Select" when no placeholder and no value', () => {
        const wrapper = mount(CustomSelect, {
            props: { options, modelValue: null },
        })
        expect(wrapper.find('.cselect__label').text()).toBe('Select')
    })

    it('opens the dropdown on trigger click', async () => {
        const wrapper = mountSelect()
        expect(wrapper.find('.cselect__list').exists()).toBe(false)
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(true)
    })

    it('closes the dropdown on second trigger click', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(true)
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(false)
    })

    it('renders all options', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.findAll('.cselect__option')).toHaveLength(3)
    })

    it('emits update:modelValue when an option is clicked', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        const opts = wrapper.findAll('.cselect__option')
        await opts[1].trigger('click')
        expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    })

    it('closes the dropdown after selecting an option', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        await wrapper.findAll('.cselect__option')[0].trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(false)
    })

    it('does not emit when a disabled option is clicked', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        const disabledOpt = wrapper.findAll('.cselect__option')[2]
        expect(disabledOpt.classes()).toContain('cselect__option--disabled')
        await disabledOpt.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('marks the selected option with the selected class', async () => {
        const wrapper = mountSelect({ modelValue: 1 })
        await wrapper.find('.cselect__trigger').trigger('click')
        const firstOpt = wrapper.findAll('.cselect__option')[0]
        expect(firstOpt.classes()).toContain('cselect__option--selected')
    })

    it('closes on Escape key', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(true)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.cselect__list').exists()).toBe(false)
    })

    it('closes on click outside', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').exists()).toBe(true)
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.cselect__list').exists()).toBe(false)
    })

    it('sets aria-expanded on the trigger button', async () => {
        const wrapper = mountSelect()
        expect(wrapper.find('.cselect__trigger').attributes('aria-expanded')).toBe('false')
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__trigger').attributes('aria-expanded')).toBe('true')
    })

    it('sets role="listbox" on the dropdown list', async () => {
        const wrapper = mountSelect()
        await wrapper.find('.cselect__trigger').trigger('click')
        expect(wrapper.find('.cselect__list').attributes('role')).toBe('listbox')
    })

    it('sets aria-selected on options', async () => {
        const wrapper = mountSelect({ modelValue: 1 })
        await wrapper.find('.cselect__trigger').trigger('click')
        const opts = wrapper.findAll('.cselect__option')
        expect(opts[0].attributes('aria-selected')).toBe('true')
        expect(opts[1].attributes('aria-selected')).toBe('false')
    })

    it('applies minWidth style when prop is provided', () => {
        const wrapper = mountSelect({ minWidth: '200px' })
        expect(wrapper.find('.cselect').attributes('style')).toContain('min-width: 200px')
    })
})
