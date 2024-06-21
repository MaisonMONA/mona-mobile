import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/register",
  },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "", //home is map
        redirect: "/tabs/map",
      },
      {
        path: "map", // carte
        component: () => import("@/views/MapPage.vue"),
      },
      {
        path: "list", // annuaire
        component: () => import("@/views/ListPage.vue"),
      },
      {
        path: "collection",
        component: () => import("@/views/CollectionPage.vue"),
      },
      {
        path: "more",
        component: () => import("@/views/MorePage.vue"),
      },
    ],
  },
  {
    path: "/discovery-details/:type/:id",
    component: () => import("@/views/DiscoveryDetailsPage.vue"),
  },
  {
    path: "/discovery-review",
    component: () => import("@/views/DiscoveryReviewPage.vue"),
  },
  {
    path: "/register",
    component: () => import("@/views/RegisterPage.vue"),
  },
  {
    path: "/login",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: "/loading",
    component: () => import("@/views/DataLoadingPage.vue"),
  },
  {
    path: "/delete",
    component: () => import("@/views/DeleteAllData.vue"),
  },
  {
    path: "/tutorial",
    component: () => import("@/views/TutorialPage.vue"),
  },
  {
    path: "/permission-denied",
    component: () => import("@/views/PermissionDeniedPage.vue"),
  },
  {
    path: "/forgot-password",
    component: () => import("@/views/ForgotPasswordPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
