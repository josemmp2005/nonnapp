/**
 * Tests unitarios de `lib/oneTimeToken.ts`: generar el par crudo/hash y
 * consumir un token dentro de una transacción (sin BBDD real — el `client`
 * se mockea).
 */

import { describe, it, expect, vi } from 'vitest';
import type { PoolClient } from 'pg';
import { generateToken, hashToken, consumeToken } from '../src/lib/oneTimeToken.js';

describe('generateToken / hashToken', () => {
  it('genera un token crudo de 64 caracteres hex cuyo hash coincide con hashToken', () => {
    const { raw, hash } = generateToken();

    expect(raw).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashToken(raw));
  });

  it('dos tokens generados seguidos no coinciden', () => {
    expect(generateToken().raw).not.toBe(generateToken().raw);
  });
});

describe('consumeToken', () => {
  const mockClient = (rows: unknown[]) => {
    const query = vi.fn().mockResolvedValueOnce({ rows }).mockResolvedValueOnce({ rows: [] });
    return { query } as unknown as PoolClient;
  };

  it('devuelve el userId y marca el token usado cuando existe uno válido', async () => {
    const client = mockClient([{ id: 'token-1', user_id: 'user-1' }]);

    const result = await consumeToken(client, 'password_reset_tokens', 'raw-token', 'inválido');

    expect(result).toEqual({ userId: 'user-1' });
    expect(client.query).toHaveBeenCalledTimes(2);
    const [updateSql, updateParams] = vi.mocked(client.query).mock.calls[1];
    expect(updateSql).toContain('password_reset_tokens');
    expect(updateSql).toContain('SET used_at = NOW()');
    expect(updateParams).toEqual(['token-1']);
  });

  it('usa la tabla correcta en la consulta de búsqueda', async () => {
    const client = mockClient([{ id: 't', user_id: 'u' }]);

    await consumeToken(client, 'email_verification_tokens', 'raw-token', 'inválido');

    const [selectSql, selectParams] = vi.mocked(client.query).mock.calls[0];
    expect(selectSql).toContain('email_verification_tokens');
    expect(selectParams).toEqual([hashToken('raw-token')]);
  });

  it('lanza un error con status 400 y el mensaje dado si no hay ningún token válido, sin marcar nada como usado', async () => {
    const client = mockClient([]);

    await expect(consumeToken(client, 'password_reset_tokens', 'raw-token', 'Token inválido o expirado')).rejects.toMatchObject({
      message: 'Token inválido o expirado',
      status: 400,
    });
    expect(client.query).toHaveBeenCalledTimes(1);
  });
});
