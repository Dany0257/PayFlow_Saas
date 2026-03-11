'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '',
        businessName: '', phone: '', address: '', city: '', siret: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
        }}>
            {/* Left panel */}
            <div className="gradient-dark" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 48, color: 'white', position: 'sticky', top: 0, height: '100vh',
            }}>
                <div className="animate-fade-in" style={{ maxWidth: 440 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, fontWeight: 800, color: 'white',
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                        }}>P</div>
                        <span style={{ fontSize: 26, fontWeight: 800 }}>PayFlow</span>
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                        Lancez-vous en quelques minutes
                    </h1>
                    <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, marginBottom: 32 }}>
                        Inscription gratuite. Aucune carte bancaire requise.
                        Commencez à facturer dès aujourd&apos;hui.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['Factures illimitées', 'Paiements Apple Pay & Google Pay', 'Notifications SMS & WhatsApp', 'Statistiques en temps réel'].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 24,
                                    background: 'rgba(16,185,129,0.2)', color: '#34d399',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, flexShrink: 0,
                                }}>✓</div>
                                <span style={{ fontSize: 15 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '48px',
            }}>
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: 480 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Créer votre compte
                    </h2>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>
                        Remplissez les informations ci-dessous pour commencer
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                            background: '#fee2e2', color: '#991b1b', fontSize: 14, fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label className="label">Prénom</label>
                                <input
                                    type="text" name="firstName" className="input"
                                    placeholder="Jean" value={formData.firstName}
                                    onChange={handleChange} required
                                />
                            </div>
                            <div>
                                <label className="label">Nom</label>
                                <input
                                    type="text" name="lastName" className="input"
                                    placeholder="Dupont" value={formData.lastName}
                                    onChange={handleChange} required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Email professionnel</label>
                            <input
                                type="email" name="email" className="input"
                                placeholder="vous@entreprise.com" value={formData.email}
                                onChange={handleChange} required
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Mot de passe</label>
                            <input
                                type="password" name="password" className="input"
                                placeholder="Minimum 8 caractères" value={formData.password}
                                onChange={handleChange} required minLength={8}
                            />
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '24px 0' }} />

                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Nom de l&apos;entreprise</label>
                            <input
                                type="text" name="businessName" className="input"
                                placeholder="Mon entreprise" value={formData.businessName}
                                onChange={handleChange} required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label className="label">Téléphone</label>
                                <input
                                    type="tel" name="phone" className="input"
                                    placeholder="+33 6 12 34 56 78" value={formData.phone}
                                    onChange={handleChange} required
                                />
                            </div>
                            <div>
                                <label className="label">Ville</label>
                                <input
                                    type="text" name="city" className="input"
                                    placeholder="Paris" value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label className="label">Adresse</label>
                                <input
                                    type="text" name="address" className="input"
                                    placeholder="12 rue de la Paix" value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="label">SIRET <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optionnel)</span></label>
                                <input
                                    type="text" name="siret" className="input"
                                    placeholder="123 456 789" value={formData.siret}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '14px', fontSize: 16 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="spinner" style={{ width: 18, height: 18 }}></span>
                                    Création...
                                </span>
                            ) : 'Créer mon compte'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)', fontSize: 14 }}>
                        Déjà un compte ?{' '}
                        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
