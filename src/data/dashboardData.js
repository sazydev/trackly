export const monthlyData = [
  { month: "Jan", revenue: 4200, expenses: 1800, profit: 2400, sales: 72 },
  { month: "Fév", revenue: 6800, expenses: 2400, profit: 4400, sales: 108 },
  { month: "Mar", revenue: 9400, expenses: 3100, profit: 6300, sales: 141 },
  { month: "Avr", revenue: 7800, expenses: 2900, profit: 4900, sales: 126 },
  { month: "Mai", revenue: 12450, expenses: 3900, profit: 8550, sales: 186 },
  { month: "Juin", revenue: 15200, expenses: 4200, profit: 11000, sales: 224 },
];

export const sourcesData = [
  { name: "Dropshipping", value: 48 },
  { name: "Produits digitaux", value: 26 },
  { name: "Services", value: 18 },
  { name: "Affiliation", value: 8 },
];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);