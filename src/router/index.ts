import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/more'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/more'
      },
      {
        path: 'artwork-of-the-day',
        component: () => import('@/views/ArtoftheDayPage.vue')
      },
      {
        path: 'artworks-list',
        component: () => import('@/views/ArtworksListPage.vue')
      },
      {
        path: 'map',
        component: () => import('@/views/MapPage.vue')
      },
      {
        path: 'collection',
        component: () => import('@/views/CollectionPage.vue')
      },
      {
        path: 'more',
        component: () => import('@/views/MorePage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
