'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PayInvoicePage() {
    const params = useParams();
    const token = params.token as string;
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            api.getInvoiceByToken(token)
                .then(setInvoice)
                .catch((err) => setError(err.message || 'Facture non trouvée'))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--gray-50)',
            }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--gray-50)',
            }}>
                <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Facture non trouvée</h2>
                    <p style={{ color: 'var(--gray-500)' }}>{error || 'Ce lien de paiement est invalide ou expiré.'}</p>
                </div>
            </div>
        );
    }

    const isPaid = invoice.status === 'PAID';

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--gray-50)',
            padding: '40px 20px',
        }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 800, color: 'white',
                    }} className="gradient-primary">P</div>
                    <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>PayFlow</div>
                    <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Paiement sécurisé</p>
                </div>

                {/* Invoice card */}
                <div className="card animate-fade-in" style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--gray-200)',
                    }}>
                        <div>
                            <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>
                                FACTURE
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{invoice.number}</div>
                        </div>
                        {isPaid ? (
                            <span className="badge badge-paid" style={{ fontSize: 14, padding: '8px 16px' }}>✓ Payée</span>
                        ) : (
                            <span className="badge badge-sent" style={{ fontSize: 14, padding: '8px 16px' }}>En attente</span>
                        )}
                    </div>

                    {/* Business info */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 6 }}>DE</div>
                        <div style={{ fontWeight: 600 }}>{invoice.business?.name}</div>
                        {invoice.business?.address && (
                            <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{invoice.business.address}</div>
                        )}
                    </div>

                    {/* Client info */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 6 }}>POUR</div>
                        <div style={{ fontWeight: 600 }}>{invoice.client?.name}</div>
                        {invoice.client?.email && (
                            <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{invoice.client.email}</div>
                        )}
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 12 }}>DÉTAILS</div>
                        {invoice.items?.map((item: any) => (
                            <div key={item.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0', borderBottom: '1px solid var(--gray-100)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{item.description}</div>
                                    <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                                        {item.quantity} × {Number(item.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600 }}>
                                    {Number(item.total).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: 'var(--gray-500)' }}>Sous-total</span>
                            <span>{Number(invoice.amount).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}</span>
                        </div>
                        {Number(invoice.taxAmount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: 'var(--gray-500)' }}>TVA ({Number(invoice.taxRate)}%)</span>
                                <span>{Number(invoice.taxAmount).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}</span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 20, fontWeight: 800, paddingTop: 12, borderTop: '1px solid var(--gray-200)',
                        }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>
                                {Number(invoice.totalAmount).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency })}
                            </span>
                        </div>
                    </div>

                    {/* Due date */}
                    <div style={{
                        marginTop: 16, padding: '10px 14px', borderRadius: 10,
                        background: 'var(--gray-50)', fontSize: 14, color: 'var(--gray-500)',
                    }}>
                        📅 Échéance : {new Date(invoice.dueDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                    </div>
                </div>

                {/* Payment buttons */}
                {!isPaid && (
                    <div className="card animate-fade-in" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
                            Choisissez votre moyen de paiement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button className="btn" style={{
                                padding: '16px', fontSize: 16, fontWeight: 600,
                                background: '#000', color: '#fff', borderRadius: 12,
                            }}>
                                Apple Pay
                            </button>
                            <button className="btn" style={{
                                padding: '16px', fontSize: 16, fontWeight: 600,
                                background: '#fff', color: '#000', border: '2px solid var(--gray-200)',
                                borderRadius: 12,
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                    Google Pay
                                </span>
                            </button>
                            <button className="btn" style={{
                                padding: '16px', fontSize: 16, fontWeight: 600,
                                background: '#ffc439', color: '#003087', borderRadius: 12,
                            }}>
                                PayPal
                            </button>
                            <button className="btn" style={{
                                padding: '16px', fontSize: 16, fontWeight: 600,
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: 'white', borderRadius: 12,
                            }}>
                                💳 Carte bancaire
                            </button>
                        </div>
                        <p style={{
                            textAlign: 'center', marginTop: 16, fontSize: 12,
                            color: 'var(--gray-400)',
                        }}>
                            🔒 Paiement sécurisé par Stripe et PayPal
                        </p>
                    </div>
                )}

                {isPaid && (
                    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
                            Paiement effectué
                        </h3>
                        <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>
                            Merci ! Cette facture a été réglée.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
