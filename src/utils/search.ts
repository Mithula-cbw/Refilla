import { VaultAccount, VaultService } from '@/types';

export interface SearchResult {
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  accountId: string;
  accountLabel: string;
  entryId: string;
  key: string;
  value: string;
  tags: string[];
  matchedField: 'accountLabel' | 'key' | 'value' | 'tag';
}

/**
 * Search across all vault services, accounts, and entries.
 */
export function searchVault(
  query: string,
  vaultServices: VaultService[],
  vaultAccounts: VaultAccount[]
): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const account of vaultAccounts) {
    const service = vaultServices.find((s) => s.id === account.vaultServiceId);
    if (!service) continue;

    // Match accountLabel
    if (account.accountLabel.toLowerCase().includes(q)) {
      for (const entry of account.entries) {
        results.push({
          serviceId: service.id,
          serviceName: service.name,
          serviceIcon: service.icon,
          accountId: account.id,
          accountLabel: account.accountLabel,
          entryId: entry.id,
          key: entry.key,
          value: entry.value,
          tags: entry.tags,
          matchedField: 'accountLabel',
        });
      }
      continue;
    }

    for (const entry of account.entries) {
      const matchedField = entry.key.toLowerCase().includes(q)
        ? 'key'
        : entry.value.toLowerCase().includes(q)
        ? 'value'
        : entry.tags.some((t) => t.toLowerCase().includes(q))
        ? 'tag'
        : null;

      if (matchedField) {
        results.push({
          serviceId: service.id,
          serviceName: service.name,
          serviceIcon: service.icon,
          accountId: account.id,
          accountLabel: account.accountLabel,
          entryId: entry.id,
          key: entry.key,
          value: entry.value,
          tags: entry.tags,
          matchedField: matchedField as SearchResult['matchedField'],
        });
      }
    }
  }

  return results;
}

/**
 * Highlight matched text by wrapping with <mark>.
 */
export function highlight(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeRegex(query);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncate a string to maxLen, appending "…" if needed.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}
