/** Screens in the sidebar and on the menu, grouped: [group label, [route, icon, label][]]. Access comes from NEED. */
export const NAV = [
  [
    'nav.money',
    [
      ['today', '📊', 'today.title'],
      ['sales', '🧾', 'history.title'],
      ['debts', '📒', 'debt.title'],
      ['reports', '📈', 'reports.title'],
    ],
  ],
  [
    'nav.goods',
    [
      ['stock', '📦', 'stock.title'],
      ['products', '👕', 'products.title'],
      ['labels', '🏷', 'labels.title'],
      ['tagging', '✅', 'tagging.title'],
      ['import', '📥', 'import.title'],
    ],
  ],
  [
    'nav.admin',
    [
      ['units', '📏', 'units.title'],
      ['scanner', '🔍', 'scanner.title'],
      ['backup', '💾', 'backup.title'],
      ['cloud', '☁️', 'cloud.title'],
      ['settings', '⚙️', 'settings.title'],
      ['users', '👥', 'users.title'],
      ['audit', '📜', 'audit.title'],
    ],
  ],
] as const
