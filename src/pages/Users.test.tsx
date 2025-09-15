import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Users from './Users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUsers = [
  {
    id: 1,
    name: 'Leanne Graham',
    email: 'Sincere@april.biz',
    company: { name: 'Romaguera-Crona' },
  },
];

describe('Users page', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient({
      defaultOptions: { queries: { retry: 0, staleTime: 0 } },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    qc.clear();
  });

  it('ローディング→取得成功でテーブル表示', async () => {
    render(
      <QueryClientProvider client={qc}>
        <Users />
      </QueryClientProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(async () => {
      expect(await screen.findByRole('table', { name: 'users' })).toBeInTheDocument();
      expect(await screen.findByText('Leanne Graham')).toBeInTheDocument();
    });
  });
});

