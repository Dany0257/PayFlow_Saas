'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface DashboardStats {
    overview: {
        totalInvoices: number;
        paidInvoices: number;
        overdueInvoices: number;
        draftInvoices: number;
        totalClients: number;
        totalRevenue: number;
        totalPending: number;
    };
    recentInvoices: any[];
}

const statusBadge: Record<string, { class: string; label: string }> = {
    DRAFT: { class: 'badge badge-draft', label: 'Brouillon' },
    SENT: { class: 'badge badge-sent', label: 'Envoyée' },
    PAID: { class: 'badge badge-paid', label: 'Payée' },
    OVERDUE: { class: 'badge badge-overdue', label: 'En retard' },
    CANCELLED: { class: 'badge badge-cancelled', label: 'Annulée' },
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Dashboard');

    useEffect(() => {
        api.getDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    const overview = stats?.overview || {
        totalInvoices: 0, paidInvoices: 0, overdueInvoices: 0,
        draftInvoices: 0, totalClients: 0, totalRevenue: 0, totalPending: 0,
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>{t('title')}</h1>
                <p>{t('overview')}</p>
            </div>

            {/* Stats grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20, marginBottom: 32,
            }}>
                <div className="stat-card primary">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                        {t('totalRevenue')}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {Number(overview.totalRevenue).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
                        {overview.paidInvoices} {t('paidInvoices')}
                    </div>
                </div>

                <div className="stat-card warning">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                        {t('pending')}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {Number(overview.totalPending).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>
                        {t('toCollect')}
                    </div>
                </div>

                <div className="stat-card success">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                        {t('invoices')}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {overview.totalInvoices}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                        {overview.overdueInvoices > 0 && (
                            <span style={{ color: 'var(--danger)' }}>{overview.overdueInvoices} {t('overdue')}</span>
                        )}
                        {overview.overdueInvoices === 0 && t('upToDate')}
                    </div>
                </div>

                <div className="stat-card danger">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                        {t('clients')}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {overview.totalClients}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                        {t('inDatabase')}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                <Link href="/dashboard/invoices/new" className="btn btn-primary">
                    {t('newInvoice')}
                </Link>
                <Link href="/dashboard/clients" className="btn btn-secondary">
                    {t('manageClients')}
                </Link>
            </div>

            {/* Recent invoices */}
            <div>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 16,
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('recentInvoices')}</h2>
                    <Link href="/dashboard/invoices" style={{
                        color: 'var(--primary)', fontWeight: 600, fontSize: 14,
                    }}>
                        {t('viewAll')}
                    </Link>
                </div>

                {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Client</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentInvoices.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 600 }}>{inv.number}</td>
                                        <td>{inv.client?.name || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {Number(inv.totalAmount).toLocaleString('fr-FR', { style: 'currency', currency: inv.currency })}
                                        </td>
                                        <td>
                                            <span className={statusBadge[inv.status]?.class || 'badge badge-draft'}>
                                                {statusBadge[inv.status]?.label || inv.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--gray-500)' }}>
                                            {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state card">
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                        <h3>{t('noInvoices')}</h3>
                        <p>{t('createFirst')}</p>
                        <Link href="/dashboard/invoices/new" className="btn btn-primary">
                            {t('createButton')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
