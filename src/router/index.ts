import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
    },
    {
        path: '/search',
        name: 'search',
        component: () => import('@/views/SearchResultsView.vue'),
    },
    {
        path: '/show/:id',
        name: 'show-detail',
        component: () => import('@/views/ShowDetailView.vue'),
        props: true,
    },
    {
        path: '/genre/:name',
        name: 'genre',
        component: () => import('@/views/GenreView.vue'),
        props: true,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        return savedPosition || { top: 0 }
    },
})

export default router
