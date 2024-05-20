import { createRouter, createWebHistory } from 'vue-router'

import CreateClaim from "@/components/CreateClaim.vue";
import VerifySignaturePage from "@/pages/VerifySignaturePage.vue";
import HomePage from "@/pages/HomePage.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
    }, {
        path: '/VerifySignaturePage',
        name: 'VerifySignaturePage',
        component: VerifySignaturePage
    }
    ];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;