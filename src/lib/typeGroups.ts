interface FilterOption {
  value: string;
  label: string;
}

export interface TypeGroup extends FilterOption {
  subtypes: FilterOption[];
}

type Translator = (key: string) => string;

/**
 * Monster/Spell/Trap categories with their precise subtypes, shared by the
 * showcase and banlist filter sidebars. Values are prefixed by category so
 * the same word ("Normal", "Continuous"...) doesn't collide across
 * categories — see parseSubtype() in lib/cards.ts. `t` should be a
 * translator for the `filters` message namespace.
 */
export function buildTypeGroups(t: Translator): TypeGroup[] {
  return [
    {
      value: 'Monster',
      label: t('monster'),
      subtypes: [
        { value: 'monster:normal', label: t('subtypes.normal') },
        { value: 'monster:effect', label: t('subtypes.effect') },
        { value: 'monster:ritual', label: t('subtypes.ritual') },
        { value: 'monster:fusion', label: t('subtypes.fusion') },
        { value: 'monster:synchro', label: t('subtypes.synchro') },
        { value: 'monster:xyz', label: t('subtypes.xyz') },
        { value: 'monster:link', label: t('subtypes.link') },
      ],
    },
    {
      value: 'Spell',
      label: t('spell'),
      subtypes: [
        { value: 'spell:Normal', label: t('subtypes.spellNormal') },
        { value: 'spell:Quick-Play', label: t('subtypes.quickPlay') },
        { value: 'spell:Continuous', label: t('subtypes.spellContinuous') },
        { value: 'spell:Field', label: t('subtypes.field') },
        { value: 'spell:Equip', label: t('subtypes.equip') },
        { value: 'spell:Ritual', label: t('subtypes.spellRitual') },
      ],
    },
    {
      value: 'Trap',
      label: t('trap'),
      subtypes: [
        { value: 'trap:Normal', label: t('subtypes.trapNormal') },
        { value: 'trap:Continuous', label: t('subtypes.trapContinuous') },
        { value: 'trap:Counter', label: t('subtypes.counter') },
      ],
    },
  ];
}
