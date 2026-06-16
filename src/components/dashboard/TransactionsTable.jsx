import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Search, Trash2, X } from "lucide-react";
import { formatCurrency } from "../../data/dashboardData";

export default function TransactionsTable({
  transactions = [],
  title = "Dernières transactions",
  onEdit,
  onDelete,
  full = false,
}) {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const businessOptions = useMemo(() => {
    return ["Tous", ...new Set(transactions.map((item) => item.business_type))];
  }, [transactions]);

  const typeOptions = useMemo(() => {
    return ["Tous", ...new Set(transactions.map((item) => item.transaction_type))];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((item) => {
        const matchesSearch =
          item.title?.toLowerCase().includes(search.toLowerCase()) ||
          item.business_type?.toLowerCase().includes(search.toLowerCase()) ||
          item.transaction_type?.toLowerCase().includes(search.toLowerCase());

        const matchesBusiness =
          businessFilter === "Tous" || item.business_type === businessFilter;

        const matchesType =
          typeFilter === "Tous" || item.transaction_type === typeFilter;

        return matchesSearch && matchesBusiness && matchesType;
      })
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transactions, search, businessFilter, typeFilter]);

  const displayedTransactions = full
    ? filteredTransactions
    : filteredTransactions.slice(0, 8);

  async function confirmDelete() {
    if (!transactionToDelete) return;

    await onDelete(transactionToDelete);
    setTransactionToDelete(null);
  }

  return (
    <>
      <section className="panel transactions-panel">
        <div className="panel-header">
          <div>
            <h3>{title}</h3>
            <p>Historique des ventes, dépenses et opérations enregistrées.</p>
          </div>
        </div>

        <div className="transactions-tools">
          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
          >
            {businessOptions.map((business) => (
              <option key={business} value={business}>
                {business}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {displayedTransactions.length === 0 ? (
          <div className="mini-empty">
            <p>Aucune transaction à afficher.</p>
          </div>
        ) : (
          <div className="transactions-table">
            <div className="table-row table-head">
              <span>Transaction</span>
              <span>Business</span>
              <span>Type</span>
              <span>CA</span>
              <span>Dépenses</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {displayedTransactions.map((transaction) => (
              <div className="table-row" key={transaction.id}>
                <span>{transaction.title}</span>
                <span>{transaction.business_type}</span>
                <span>{transaction.transaction_type}</span>

                <span className="positive-text">
                  {formatCurrency(Number(transaction.revenue || 0))}
                </span>

                <span className="negative-text">
                  {formatCurrency(Number(transaction.expenses || 0))}
                </span>

                <span>
                  {new Date(transaction.transaction_date).toLocaleDateString("fr-FR")}
                </span>

                <div className="table-actions">
                  <button onClick={() => onEdit(transaction)} aria-label="Modifier">
                    <Pencil size={15} />
                  </button>

                  <button
                    className="danger-action"
                    onClick={() => setTransactionToDelete(transaction)}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {transactionToDelete && (
        <div
          className="delete-modal-overlay"
          onClick={() => setTransactionToDelete(null)}
        >
          <div
            className="delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="delete-modal-close"
              onClick={() => setTransactionToDelete(null)}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="delete-modal-icon">
              <AlertTriangle size={28} />
            </div>

            <span className="delete-modal-kicker">Suppression définitive</span>

            <h3>Supprimer cette transaction ?</h3>

            <p>
              Tu es sur le point de supprimer{" "}
              <strong>{transactionToDelete.title}</strong>. Cette action est
              définitive.
            </p>

            <div className="delete-modal-summary">
              <span>Montant</span>
              <strong>
                {formatCurrency(Number(transactionToDelete.revenue || 0))}
              </strong>
            </div>

            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => setTransactionToDelete(null)}
              >
                Annuler
              </button>

              <button className="delete-confirm-btn" onClick={confirmDelete}>
                <Trash2 size={17} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}