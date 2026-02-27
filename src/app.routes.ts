import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.waitForAuth();
    if (auth.isLoggedIn()) {
        return true;
    }
    return router.parseUrl('/login');
};

const publicGuard = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.waitForAuth();
    if (auth.isLoggedIn()) {
        return router.parseUrl('/dashboard');
    }
    return true;
};

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'signup',
        loadComponent: () => import('./components/auth/signup.component').then(m => m.SignupComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./components/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [publicGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./components/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
            },
            {
                path: 'interviews',
                loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./components/dashboard-history/dashboard-history.component').then(m => m.DashboardHistoryComponent)
            },
            {
                path: 'resume',
                loadComponent: () => import('./components/dashboard-resume/dashboard-resume.component').then(m => m.DashboardResumeComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./components/dashboard-settings/dashboard-settings.component').then(m => m.DashboardSettingsComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
            }
        ]
    },
    {
        path: 'interview',
        loadComponent: () => import('./components/interview/interview.component').then(m => m.InterviewComponent),
        canActivate: [authGuard]
    },
    {
        path: 'report',
        loadComponent: () => import('./components/report/report.component').then(m => m.ReportComponent),
        canActivate: [authGuard]
    },
    {
        path: 'about',
        loadComponent: () => import('./components/legal/about.component').then(m => m.AboutComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./components/legal/contact.component').then(m => m.ContactComponent)
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./components/legal/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
    },
    {
        path: 'terms-of-service',
        loadComponent: () => import('./components/legal/terms-of-service.component').then(m => m.TermsOfServiceComponent)
    },
    {
        path: 'cookie-policy',
        loadComponent: () => import('./components/legal/cookie-policy.component').then(m => m.CookiePolicyComponent)
    },
    {
        path: 'refund-policy',
        loadComponent: () => import('./components/legal/refund-policy.component').then(m => m.RefundPolicyComponent)
    },
    { path: '**', redirectTo: '' }
];
