import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from '../../lib/router';
import { api } from '../../api';
import { setStaffPin } from '../../api/staffPin';
import { useStaff } from '../../hooks/useStaff';

/** Shows its content only after the staff code has been accepted by the server. */
export function StaffGate({ children }: { children: ReactNode }) {
  const { unlocked } = useStaff();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (unlocked) return <>{children}</>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (await api.verifyStaff(pin.trim())) setStaffPin(pin.trim());
      else setError('Code incorrect.');
    } catch {
      setError('Serveur injoignable. Vérifiez que l’API est lancée.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-checkin">
      <main className="checkin-main">
        <form className="card gate" onSubmit={submit}>
          <h2>Espace staff</h2>
          <p className="muted">Réservé aux organisateurs. Entrez le code staff.</p>
          <input
            className="gate-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            aria-label="Code staff"
          />
          {error && <div className="error">{error}</div>}
          <button className="btn-primary" disabled={busy || !pin.trim()}>{busy ? 'Vérification…' : 'Déverrouiller'}</button>
          <Link to="/" className="link-quiet gate-back">Retour à la carte</Link>
        </form>
      </main>
    </div>
  );
}
