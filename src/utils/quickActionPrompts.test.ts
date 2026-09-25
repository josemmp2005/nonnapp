/**
 * Tests de los textos de las acciones rápidas del dashboard: cada pulsación
 * debe empujar a la IA hacia un enfoque distinto, sin repetir ninguno hasta
 * haberlos usado todos.
 */

import { describe, it, expect } from 'vitest';
import { createQuickActionPrompts, type QuickAction } from './quickActionPrompts';

const ACTIONS: QuickAction[] = ['breakfast', 'healthy', 'surprise'];

// Mínimo de enfoques distintos que debe tener cada acción.
const MIN_ANGLES: Record<QuickAction, number> = { breakfast: 10, healthy: 10, surprise: 30 };

// Aleatorio reproducible (mulberry32) para no depender de la suerte.
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const calls = (prompt: (a: QuickAction) => string, action: QuickAction, n: number) =>
  Array.from({ length: n }, () => prompt(action));

describe('createQuickActionPrompts', () => {
  it('mantiene la intención original de cada acción', () => {
    const prompt = createQuickActionPrompts(seeded(1));
    expect(prompt('breakfast')).toContain('desayuno');
    expect(prompt('breakfast')).toContain('rápido');
    expect(prompt('healthy')).toContain('cena ligera');
    expect(prompt('healthy')).toContain('alta en proteínas');
    expect(prompt('surprise')).toContain('Sorpréndeme');
  });

  it('no repite ningún enfoque hasta haberlos usado todos', () => {
    for (const action of ACTIONS) {
      const texts = calls(createQuickActionPrompts(seeded(7)), action, MIN_ANGLES[action]);
      expect(new Set(texts).size, `${action}: las primeras ${MIN_ANGLES[action]} pulsaciones deben ser todas distintas`).toBe(
        MIN_ANGLES[action]
      );
    }
  });

  it('nunca repite el mismo enfoque dos veces seguidas, tampoco al empezar una ronda nueva', () => {
    for (const action of ACTIONS) {
      for (const random of [seeded(3), () => 0, () => 0.5, () => 0.999999]) {
        const texts = calls(createQuickActionPrompts(random), action, 150);
        texts.slice(1).forEach((text, i) => expect(text, `${action}, pulsación ${i + 2}`).not.toBe(texts[i]));
      }
    }
  });

  it('cada ronda recorre todos los enfoques y el orden cambia de una ronda a otra', () => {
    const prompt = createQuickActionPrompts(seeded(11));
    const round = () => calls(prompt, 'breakfast', MIN_ANGLES.breakfast);
    const first = round();
    const second = round();
    expect(new Set(second)).toEqual(new Set(first));
    expect(second).not.toEqual(first);
  });

  it('recuerda el estado de cada acción por separado', () => {
    const prompt = createQuickActionPrompts(seeded(5));
    const first = prompt('breakfast');
    calls(prompt, 'surprise', 3); // otra acción por medio no altera la ronda del desayuno
    const rest = calls(prompt, 'breakfast', MIN_ANGLES.breakfast - 1);
    expect(new Set([first, ...rest]).size).toBe(MIN_ANGLES.breakfast);
  });

  it('aguanta un aleatorio en el borde (1) sin salirse de la lista', () => {
    for (const action of ACTIONS) {
      for (const text of calls(createQuickActionPrompts(() => 1), action, MIN_ANGLES[action] + 2)) {
        expect(text).not.toContain('undefined');
      }
    }
  });

  it('el desayuno rápido pide evitar la avena, en la que caía casi siempre', () => {
    for (const text of calls(createQuickActionPrompts(seeded(2)), 'breakfast', MIN_ANGLES.breakfast)) {
      expect(text).toMatch(/no uses avena/i);
    }
  });

  it('el modo fit solo pide pollo en un enfoque y lo descarta en los formatos que la IA rellena con pollo', () => {
    const texts = calls(createQuickActionPrompts(seeded(2)), 'healthy', MIN_ANGLES.healthy);
    const avoidsChicken = (t: string) => /sin pollo|que no sea pollo/i.test(t);
    // "sin pollo" / "que no sea pollo" cuentan como evitarlo
    expect(texts.filter((t) => /pollo/i.test(t) && !avoidsChicken(t)).length).toBeLessThanOrEqual(1);
    // ensalada, sopa, salteado o "verduras + proteína" acababan siempre en pollo
    const chickenProneFormats = texts.filter((t) => /ensalada|sopa|salteado|wok|verduras/i.test(t));
    expect(chickenProneFormats.length).toBeGreaterThanOrEqual(3);
    chickenProneFormats.forEach((t) => expect(t).toSatisfy(avoidsChicken));
  });

  it('sorpréndeme reparte entre muchas cocinas del mundo', () => {
    const texts = calls(createQuickActionPrompts(seeded(9)), 'surprise', MIN_ANGLES.surprise);
    expect(new Set(texts).size).toBe(MIN_ANGLES.surprise);
  });
});
