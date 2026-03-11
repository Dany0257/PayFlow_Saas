'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
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
                padding: 48, color: 'white',
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
                    <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                        Bienvenue sur votre espace de gestion
                    </h1>
                    <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7 }}>
                        Gérez vos factures, suivez vos paiements et développez votre activité
                        avec notre plateforme intuitive.
                    </p>
                </div>
            </div>

            {/* Right panel - form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 48,
            }}>
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Connexion
                    </h2>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>
                        Connectez-vous à votre compte PayFlow
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
                        <div style={{ marginBottom: 20 }}>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="vous@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label className="label">Mot de passe</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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
                                    Connexion...
                                </span>
                            ) : 'Se connecter'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray-500)', fontSize: 14 }}>
                        Pas encore de compte ?{' '}
                        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
