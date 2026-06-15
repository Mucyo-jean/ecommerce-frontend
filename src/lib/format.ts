export function formatPrice(value: number | string, currency = 'RWF'): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currency}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
