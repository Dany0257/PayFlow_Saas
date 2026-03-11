'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        clientId: '',
        dueDate: '',
        currency: 'EUR',
        taxRate: 20,
        notes: '',
    });

    const [items, setItems] = useState([
        { description: '', quantity: 1, unitPrice: 0 },
    ]);

    useEffect(() => {
        api.getClients().then(setClients).catch(console.error);
    }, []);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        (updated[index] as any)[field] = value;
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.createInvoice({
                clientId: formData.clientId,
                dueDate: formData.dueDate,
                currency: formData.currency,
                taxRate: formData.taxRate,
                notes: formData.notes,
                items: items.map((item) => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                })),
            });
            router.push('/dashboard/invoices');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Nouvelle facture</h1>
                <p>Créez et envoyez une facture professionnelle</p>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                    background: '#fee2e2', color: '#991b1b', fontSize: 14, fontWeight: 500,
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Left column */}
                    <div>
                        {/* Client & Date */}
                        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informations</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label className="label">Client</label>
                                    <select
                                        className="input"
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {clients.length === 0 && (
                                        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                                            Ajoutez d&apos;abord un client dans la section Clients
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="label">Date d&apos;échéance</label>
                                    <input
                                        type="date" className="input" value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                                <div>
                                    <label className="label">Devise</label>
                                    <select
                                        className="input" value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="XOF">XOF (CFA)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Taux de TVA (%)</label>
                                    <input
                                        type="number" className="input" min="0" max="100" step="0.1"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Lignes de facture</h3>
                            {items.map((item, i) => (
                                <div key={i} style={{
                                    display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 40px',
                                    gap: 12, marginBottom: 12, alignItems: 'end',
                                }}>
                                    <div>
                                        {i === 0 && <label className="label">Description</label>}
                                        <input
                                            type="text" className="input" placeholder="Service / Produit"
                                            value={item.description}
                                            onChange={(e) => updateItem(i, 'description', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        {i === 0 && <label className="label">Qté</label>}
                                        <input
                                            type="number" className="input" min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        {i === 0 && <label className="label">Prix unitaire</label>}
                                        <input
                                            type="number" className="input" min="0" step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(i)}
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--gray-400)',
                                            cursor: 'pointer', fontSize: 20, padding: '8px 0',
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addItem} className="btn btn-secondary" style={{ marginTop: 8 }}>
                                + Ajouter une ligne
                            </button>
                        </div>

                        {/* Notes */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Notes</h3>
                            <textarea
                                className="input"
                                rows={3}
                                placeholder="Notes ou conditions (optionnel)"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Right column - summary */}
                    <div>
                        <div className="card" style={{ padding: 24, position: 'sticky', top: 32 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Récapitulatif</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--gray-500)' }}>Sous-total</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {subtotal.toLocaleString('fr-FR', { style: 'currency', currency: formData.currency })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--gray-500)' }}>TVA ({formData.taxRate}%)</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {taxAmount.toLocaleString('fr-FR', { style: 'currency', currency: formData.currency })}
                                    </span>
                                </div>
                                <hr style={{ border: 'none', borderTop: '2px solid var(--gray-200)', margin: '4px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700, fontSize: 18 }}>Total TTC</span>
                                    <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
                                        {total.toLocaleString('fr-FR', { style: 'currency', currency: formData.currency })}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 24 }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="spinner" style={{ width: 18, height: 18 }}></span>
                                        Création...
                                    </span>
                                ) : '📄 Créer la facture'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
