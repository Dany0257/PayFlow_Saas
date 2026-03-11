'use client';

import Link from 'next/link';
import { BsFileEarmarkText, BsCreditCard, BsPhone, BsBarChart, BsPeople, BsGlobe } from 'react-icons/bs';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }} className="glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: 'white',
          }} className="gradient-primary">P</div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>PayFlow</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn btn-secondary">Se connecter</Link>
          <Link href="/register" className="btn btn-primary">Commencer gratuitement</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-dark" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 32px 80px', textAlign: 'center', color: 'white',
      }}>
        <div className="animate-fade-in" style={{ maxWidth: 800 }}>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24,
          }}>
            Gérez vos factures et <br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>paiements en un clic</span>
          </h1>
          <p style={{
            fontSize: 18, color: '#94a3b8', maxWidth: 560,
            margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Créez des factures professionnelles, recevez les paiements par
            Apple Pay, Google Pay et PayPal. Tout en un seul endroit.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Créer mon compte gratuit →
            </Link>
            <Link href="/login" className="btn" style={{
              padding: '14px 32px', fontSize: 16,
              background: 'rgba(255,255,255,0.08)', color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
            Une plateforme complète pour gérer votre activité au quotidien.
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {[
            { icon: <BsFileEarmarkText />, title: 'Facturation rapide', desc: 'Créez et envoyez des factures professionnelles en quelques secondes. Numérotation automatique et calcul des taxes.' },
            { icon: <BsCreditCard />, title: 'Paiements intégrés', desc: 'Recevez les paiements par Apple Pay, Google Pay et PayPal directement depuis vos factures.' },
            { icon: <BsPhone />, title: 'Notifications', desc: 'Vos clients reçoivent automatiquement les factures et rappels par SMS et WhatsApp.' },
            { icon: <BsBarChart />, title: 'Statistiques', desc: 'Tableau de bord complet avec vos revenus, factures impayées et tendances mensuelles.' },
            { icon: <BsPeople />, title: 'Gestion clients', desc: 'Base de données de vos clients avec historique complet des factures et paiements.' },
            { icon: <BsGlobe />, title: 'Multilingue', desc: 'Interface disponible en français et anglais. Support multi-devises (EUR, USD, XOF...).' },
          ].map((f, i) => (
            <div key={i} className="card animate-fade-in" style={{
              padding: 32, animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ fontSize: 36, marginBottom: 16, color: '#6366f1' }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--gray-500)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary" style={{
        padding: '80px 32px', textAlign: 'center', color: 'white',
        margin: '0 32px 64px', borderRadius: 24,
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          Prêt à simplifier votre facturation ?
        </h2>
        <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Rejoignez des milliers d&apos;entreprises qui utilisent PayFlow au quotidien.
        </p>
        <Link href="/register" className="btn" style={{
          padding: '16px 40px', fontSize: 16,
          background: 'white', color: 'var(--primary)', fontWeight: 700,
        }}>
          Commencer maintenant — C&apos;est gratuit
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 32px', borderTop: '1px solid var(--gray-200)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
          }} className="gradient-primary">P</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>PayFlow</span>
        </div>
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>
          © 2026 PayFlow. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
