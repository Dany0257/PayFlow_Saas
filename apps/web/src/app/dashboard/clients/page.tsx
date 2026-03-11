'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', city: '', country: 'FR',
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await api.getClients();
            setClients(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', address: '', city: '', country: 'FR' });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editId) {
                await api.updateClient(editId, formData);
            } else {
                await api.createClient(formData);
            }
            resetForm();
            loadClients();
        } catch (err) {
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (client: any) => {
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            country: client.country || 'FR',
        });
        setEditId(client.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce client ?')) return;
        try {
            await api.deleteClient(id);
            loadClients();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, flexWrap: 'wrap', gap: 16,
            }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Clients</h1>
                    <p>{clients.length} client{clients.length > 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="btn btn-primary"
                >
                    + Nouveau client
                </button>
            </div>

            {/* Add/Edit form modal */}
            {showForm && (
                <div className="card animate-fade-in" style={{ padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                        {editId ? 'Modifier le client' : 'Nouveau client'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="label">Nom / Raison sociale *</label>
                                <input type="text" className="input" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input type="email" className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Téléphone</label>
                                <input type="tel" className="input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Ville</label>
                                <input type="text" className="input"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Adresse</label>
                                <input type="text" className="input"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                {formLoading ? 'Enregistrement...' : (editId ? 'Mettre à jour' : 'Ajouter le client')}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clients list */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
                    <div className="spinner" style={{ width: 40, height: 40 }}></div>
                </div>
            ) : clients.length > 0 ? (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                }}>
                    {clients.map((client) => (
                        <div key={client.id} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 16, flexShrink: 0,
                                }}>
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>{client.name}</div>
                                    {client.email && (
                                        <div style={{ fontSize: 13, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {client.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: 14 }}>
                                {client.phone && (
                                    <div style={{ color: 'var(--gray-500)' }}>📞 {client.phone}</div>
                                )}
                                {client.city && (
                                    <div style={{ color: 'var(--gray-500)' }}>📍 {client.city}</div>
                                )}
                                <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>
                                    {client._count?.invoices || 0} facture{(client._count?.invoices || 0) > 1 ? 's' : ''}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleEdit(client)} className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 13 }}>
                                    ✏️ Modifier
                                </button>
                                <button onClick={() => handleDelete(client.id)} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: 13 }}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                    <h3>Aucun client</h3>
                    <p>Ajoutez votre premier client pour commencer à créer des factures</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        + Ajouter un client
                    </button>
                </div>
            )}
        </div>
    );
}
