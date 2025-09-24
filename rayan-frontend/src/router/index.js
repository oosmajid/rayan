import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// تمام کامپوننت‌های صفحات را import می‌کنیم
import AllStudentsView from '../views/AllStudentsView.vue'
import MyCallsView from '../views/MyCallsView.vue'
import AssignmentsView from '../views/AssignmentsView.vue'
import StudentProfileView from '../views/StudentProfileView.vue'
import AdminView from '../views/AdminView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import InstallmentTrackingView from '../views/InstallmentTrackingView.vue'
import DashboardView from '../views/DashboardView.vue'
import StudentSelfProfileView from '../views/StudentSelfProfileView.vue' // جدید

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // مسیر جدید و مستقل برای پروفایل خود هنرجو
      path: '/my-profile/:id',
      name: 'student-self-profile',
      component: StudentSelfProfileView,
    },
    {
      // مسیرهای پنل ادمین و آپولون‌یار که دارای لایه اصلی هستند
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '', // صفحه اصلی
          name: 'all-students',
          component: AllStudentsView,
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'my-calls',
          name: 'my-calls',
          component: MyCallsView,
        },
        {
          path: 'assignments',
          name: 'assignments',
          component: AssignmentsView,
        },
        {
          path: 'student/:id',
          name: 'student-profile',
          component: StudentProfileView,
        },
        {
          path: 'installments',
          name: 'installments',
          component: InstallmentTrackingView,
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: TransactionsView,
        },
        {
          path: 'admin',
          name: 'admin',
          component: AdminView,
        },
      ],
    },
  ],
})

export default router
