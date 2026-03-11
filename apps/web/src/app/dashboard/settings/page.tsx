'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Paramètres</h1>
                <p>Gérez les informations de votre entreprise</p>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Informations personnelles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="label">Prénom</label>
                        <input type="text" className="input" value={user?.firstName || ''} readOnly />
                    </div>
                    <div>
                        <label className="label">Nom</label>
                        <input type="text" className="input" value={user?.lastName || ''} readOnly />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="label">Email</label>
                        <input type="email" className="input" value={user?.email || ''} readOnly />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Entreprise</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="label">Nom de l&apos;entreprise</label>
                        <input type="text" className="input" value={user?.business?.name || ''} readOnly />
                    </div>
                    <div>
                        <label className="label">Téléphone</label>
                        <input type="text" className="input" value={user?.business?.phone || ''} readOnly />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--danger)' }}>Zone de danger</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 16, fontSize: 14 }}>
                    Ces actions sont irréversibles. Soyez prudent.
                </p>
                <button className="btn btn-danger">
                    Supprimer mon compte
                </button>
            </div>
        </div>
    );
}
