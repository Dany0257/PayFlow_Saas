'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

const statusBadge: Record<string, { class: string; label: string }> = {
    DRAFT: { class: 'badge badge-draft', label: 'Brouillon' },
    SENT: { class: 'badge badge-sent', label: 'Envoyée' },
    PAID: { class: 'badge badge-paid', label: 'Payée' },
    OVERDUE: { class: 'badge badge-overdue', label: 'En retard' },
    CANCELLED: { class: 'badge badge-cancelled', label: 'Annulée' },
};

const statusFilters = [
    { value: '', label: 'Toutes' },
    { value: 'DRAFT', label: 'Brouillons' },
    { value: 'SENT', label: 'Envoyées' },
    { value: 'PAID', label: 'Payées' },
    { value: 'OVERDUE', label: 'En retard' },
];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, [filter]);

    const loadInvoices = async (page = 1) => {
        setLoading(true);
        try {
            const result = await api.getInvoices(page, 20, filter || undefined);
            setInvoices(result.data);
            setMeta(result.meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette facture ?')) return;
        try {
            await api.deleteInvoice(id);
            loadInvoices(meta.page);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadPdf = async (id: string, number: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Erreur de téléchargement');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-${number}.pdf`;
            a.click();
        } catch (err) {
            console.error(err);
            alert('Erreur lors du téléchargement');
        }
    };

    const handleSend = async (id: string) => {
        if (!confirm('Envoyer cette facture par email et SMS au client ?')) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/invoice/${id}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ channels: ['email', 'sms'] })
            });
            alert('Facture envoyée avec succès !');
            loadInvoices(meta.page);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'envoi');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, flexWrap: 'wrap', gap: 16,
            }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Factures</h1>
                    <p>{meta.total} facture{meta.total > 1 ? 's' : ''} au total</p>
                </div>
                <Link href="/dashboard/invoices/new" className="btn btn-primary">
                    + Nouvelle facture
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {statusFilters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className="btn"
                        style={{
                            padding: '8px 16px', fontSize: 13,
                            background: filter === f.value ? 'var(--primary)' : 'white',
                            color: filter === f.value ? 'white' : 'var(--gray-600)',
                            border: `1px solid ${filter === f.value ? 'var(--primary)' : 'var(--gray-200)'}`,
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            ) : invoices.length > 0 ? (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Client</th>
                                    <th>Montant HT</th>
                                    <th>Total TTC</th>
                                    <th>Statut</th>
                                    <th>Échéance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            <Link href={`/dashboard/invoices/${inv.id}`} style={{ color: 'var(--primary)' }}>
                                                {inv.number}
                                            </Link>
                                        </td>
                                        <td>{inv.client?.name || '—'}</td>
                                        <td>
                                            {Number(inv.amount).toLocaleString('fr-FR', { style: 'currency', currency: inv.currency })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {Number(inv.totalAmount).toLocaleString('fr-FR', { style: 'currency', currency: inv.currency })}
                                        </td>
                                        <td>
                                            <span className={statusBadge[inv.status]?.class || 'badge badge-draft'}>
                                                {statusBadge[inv.status]?.label || inv.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--gray-500)' }}>
                                            {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/pay/${inv.publicToken}`;
                                                        navigator.clipboard.writeText(url);
                                                        alert('Lien de paiement copié !');
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                                >
                                                    🔗 Lien
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(inv.id, inv.number)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                                    title="Télécharger PDF"
                                                >
                                                    📄
                                                </button>
                                                <button
                                                    onClick={() => handleSend(inv.id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                                    title="Envoyer au client"
                                                >
                                                    📨
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                                    title="Supprimer"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            {Array.from({ length: meta.totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => loadInvoices(i + 1)}
                                    className="btn"
                                    style={{
                                        padding: '8px 14px', fontSize: 13,
                                        background: meta.page === i + 1 ? 'var(--primary)' : 'white',
                                        color: meta.page === i + 1 ? 'white' : 'var(--gray-600)',
                                        border: `1px solid ${meta.page === i + 1 ? 'var(--primary)' : 'var(--gray-200)'}`,
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state card">
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                    <h3>Aucune facture trouvée</h3>
                    <p>{filter ? 'Aucune facture avec ce statut' : 'Créez votre première facture'}</p>
                    <Link href="/dashboard/invoices/new" className="btn btn-primary">
                        + Créer une facture
                    </Link>
                </div>
            )}
        </div>
    );
}
