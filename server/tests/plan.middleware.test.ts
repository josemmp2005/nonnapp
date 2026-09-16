import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../src/lib/subscription.js', () => ({
  getActivePlan: vi.fn(),
}));

import { getActivePlan } from '../src/lib/subscription.js';
import { requirePlan } from '../src/middleware/plan.js';

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('requirePlan middleware', () => {
  it('llama a next() si el plan activo está en la lista permitida', async () => {
    vi.mocked(getActivePlan).mockResolvedValue('nonna');
    const req = { userId: 'u1' } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requirePlan('mamma', 'nonna')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devuelve 403 PLAN_REQUIRED si el plan activo no está permitido', async () => {
    vi.mocked(getActivePlan).mockResolvedValue('nipote');
    const req = { userId: 'u1' } as Request;
    const res = mockRes();
    const next = vi.fn();

    await requirePlan('mamma', 'nonna')(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'PLAN_REQUIRED',
      plan: 'nipote',
      requiredPlans: ['mamma', 'nonna'],
    });
  });
});
