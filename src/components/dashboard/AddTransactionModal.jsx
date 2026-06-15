import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const businessTypes = [
  "Dropshipping",
  "E-commerce",
  "Produits digitaux",
  "Freelance",
  "Agence web",
  "SaaS",
  "Affiliation",
  "Coaching",
  "Formation en ligne",
  "Print on demand",
  "Consulting",
  "Création de contenu",
  "Services locaux",
  "Marketplace",
  "Autre",
];

export default function AddTransactionModal({
  user,
  onClose,
  onSaved,
  onToast,
  transactionToEdit = null,
}) {
  const isEditing = Boolean(transactionToEdit);

  const [form, setForm] = useState({
    title: "",
    business_type: "Dropshipping",
    transaction_type: "Vente",
    revenue: "",
    profit: "",
    expenses: "",
    sales_count: 1,
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const calculatedProfit = Number(form.revenue || 0) - Number(form.expenses || 0);

  useEffect(() => {
    if (transactionToEdit) {
      setForm({
        title: transactionToEdit.title || "",
        business_type: transactionToEdit.business_type || "Dropshipping",
        transaction_type: transactionToEdit.transaction_type || "Vente",
        revenue: transactionToEdit.revenue || "",
        profit: transactionToEdit.profit || "",
        expenses: transactionToEdit.expenses || "",
        sales_count: transactionToEdit.sales_count || 1,
        transaction_date:
          transactionToEdit.transaction_date ||
          new Date().toISOString().split("T")[0],
        notes: transactionToEdit.notes || "",
      });
    }
  }, [transactionToEdit]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      user_id: user.id,
      title: form.title,
      business_type: form.business_type,
      transaction_type: form.transaction_type,
      revenue: Number(form.revenue || 0),
      profit: calculatedProfit,
      expenses: Number(form.expenses || 0),
      sales_count: Number(form.sales_count || 1),
      transaction_date: form.transaction_date,
      notes: form.notes,
    };

    const request = isEditing
      ? supabase
          .from("transactions")
          .update(payload)
          .eq("id", transactionToEdit.id)
          .eq("user_id", user.id)
      : supabase.from("transactions").insert(payload);

    const { error } = await request;

    setLoading(false);

    if (error) {
      onToast?.("error", error.message);
      return;
    }

    await onSaved();
    onToast?.(
      "success",
      isEditing ? "Transaction modifiée avec succès." : "Transaction ajoutée avec succès."
    );
    onClose();
  }

  return (
    <div className="modal-overlay">
      <section className="modal-card">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {isEditing ? "Modification" : "Nouvelle transaction"}
            </span>
            <h2>{isEditing ? "Modifier la transaction" : "Ajouter une vente"}</h2>
          </div>

          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-group full">
            <label>Titre</label>
            <input
              type="text"
              placeholder="Ex : Commande Shopify #1042"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Business</label>
            <select
              value={form.business_type}
              onChange={(e) => updateField("business_type", e.target.value)}
            >
              {businessTypes.map((business) => (
                <option key={business} value={business}>
                  {business}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={form.transaction_type}
              onChange={(e) => updateField("transaction_type", e.target.value)}
            >
              <option value="Vente">Vente</option>
              <option value="Dépense">Dépense</option>
              <option value="Remboursement">Remboursement</option>
              <option value="Abonnement">Abonnement</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Chiffre d’affaires</label>
            <input
              type="number"
              placeholder="0"
              value={form.revenue}
              onChange={(e) => updateField("revenue", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Bénéfice net automatique</label>
            <input
              type="number"
              value={calculatedProfit}
              readOnly
              className="readonly-input"
            />
            <small className="auto-profit-hint">
              Calculé automatiquement : chiffre d’affaires - dépenses
            </small>
          </div>

          <div className="form-group">
            <label>Dépenses</label>
            <input
              type="number"
              placeholder="0"
              value={form.expenses}
              onChange={(e) => updateField("expenses", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nombre de ventes</label>
            <input
              type="number"
              min="1"
              value={form.sales_count}
              onChange={(e) => updateField("sales_count", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) => updateField("transaction_date", e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Notes</label>
            <textarea
              placeholder="Ex : vente via publicité TikTok Ads..."
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Enregistrement...
              </>
            ) : isEditing ? (
              "Sauvegarder les modifications"
            ) : (
              "Enregistrer la transaction"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
