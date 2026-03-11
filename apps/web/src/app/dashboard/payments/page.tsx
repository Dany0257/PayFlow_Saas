'use client';

export default function PaymentsPage() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Paiements</h1>
                <p>Historique de tous vos paiements reçus</p>
            </div>

            <div className="empty-state card">
                <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
                <h3>Aucun paiement reçu</h3>
                <p>Les paiements apparaîtront ici lorsque vos clients paieront leurs factures via Apple Pay, Google Pay ou PayPal.</p>
            </div>
        </div>
    );
}
