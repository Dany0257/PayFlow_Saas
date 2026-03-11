'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';

const navItems = [
    { href: '/dashboard', label: 'dashboard', icon: '📊' },
    { href: '/dashboard/invoices', label: 'invoices', icon: '📄' },
    { href: '/dashboard/clients', label: 'clients', icon: '👥' },
    { href: '/dashboard/payments', label: 'payments', icon: '💳' },
    { href: '/dashboard/settings', label: 'settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const t = useTranslations('Navigation');
    const tCommon = useTranslations('Common');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 30, display: 'none',
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, fontWeight: 800, color: 'white',
                        }} className="gradient-primary">P</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>PayFlow</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                                {user.business?.name || 'Mon entreprise'}
                            </div>
                        </div>
                    </div>
                </div>

                <nav style={{ padding: '16px 0', flex: 1 }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span>{t(item.label)}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                    <LanguageSwitcher />
                </div>

                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                        borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', fontWeight: 700, fontSize: 14,
                        }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.firstName} {user.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.email}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                background: 'none', border: 'none', color: 'var(--gray-400)',
                                cursor: 'pointer', fontSize: 18, padding: 4,
                            }}
                            title="Déconnexion"
                        >
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{
                flex: 1, marginLeft: 280, padding: '32px',
                minHeight: '100vh', background: 'var(--gray-50)',
            }}>
                {/* Mobile header */}
                <div style={{
                    display: 'none', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 24, padding: '12px 0',
                }} className="mobile-header">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
                        }}
                    >
                        ☰
                    </button>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>PayFlow</span>
                    <div style={{ width: 32 }}></div>
                </div>

                {children}
            </main>
        </div>
    );
}
