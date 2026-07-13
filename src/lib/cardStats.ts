/**
 * YGOPRODeck represents a monster's variable/unknown ATK or DEF (printed as
 * "?" on the card, e.g. Chimeratech Overdragon) as -1, not null. Render it
 * as "?" instead of the literal -1.
 */
export function formatAtkDef(value: number | null): string | null {
  if (value === null) return null;
  return value === -1 ? '?' : String(value);
}
