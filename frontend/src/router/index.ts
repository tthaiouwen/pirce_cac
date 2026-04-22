import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        { path: "", redirect: "/quotes/workbench" },
        {
          path: "quotes/workbench",
          name: "quote-workbench",
          component: () => import("@/views/QuoteWorkbenchView.vue")
        },
        {
          path: "quotes/history",
          name: "quote-history",
          component: () => import("@/views/QuoteHistoryView.vue")
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("@/views/AnalyticsView.vue")
        }
      ]
    }
  ]
});

export default router;
