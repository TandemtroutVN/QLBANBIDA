import { DEFAULT_MENU, DEFAULT_TABLES } from '../data/defaults';

const TABLE_CANONICAL_BY_ID = new Map(
  DEFAULT_TABLES.map(({ id, name, type }) => [id, { name, type }]),
);

const MENU_CANONICAL_BY_ID = new Map(
  DEFAULT_MENU.map(({ id, name }) => [id, { name }]),
);

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

function toAsciiFallback(value) {
  return Array.from(value, (char) => (
    char.codePointAt(0) > 127 ? '?' : char
  )).join('');
}

function toMojibake(value) {
  return Array.from(
    encoder.encode(value),
    (byte) => String.fromCharCode(byte),
  ).join('');
}

function decodeMojibake(value) {
  const bytes = [];

  for (const char of Array.from(value)) {
    const codePoint = char.codePointAt(0);

    if (codePoint > 255) {
      return value;
    }

    bytes.push(codePoint);
  }

  return decoder.decode(Uint8Array.from(bytes));
}

export function repairVietnameseText(value, expected) {
  if (typeof value !== 'string' || typeof expected !== 'string' || value === expected) {
    return value;
  }

  if (
    value === toAsciiFallback(expected) ||
    value === toMojibake(expected) ||
    decodeMojibake(value) === expected
  ) {
    return expected;
  }

  return value;
}

function repairOrderedItem(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const canonical = MENU_CANONICAL_BY_ID.get(item.id);

  if (!canonical) {
    return item;
  }

  const repairedName = repairVietnameseText(item.name, canonical.name);

  if (repairedName === item.name) {
    return item;
  }

  return {
    ...item,
    name: repairedName,
  };
}

export function repairSyncedTable(table) {
  if (!table || typeof table !== 'object') {
    return table;
  }

  const canonical = TABLE_CANONICAL_BY_ID.get(table.id);

  if (!canonical) {
    return table;
  }

  const repairedName = repairVietnameseText(table.name, canonical.name);
  const repairedType = repairVietnameseText(table.type, canonical.type);
  const repairedItems = Array.isArray(table.items)
    ? table.items.map(repairOrderedItem)
    : table.items;
  const itemsChanged = Array.isArray(table.items) && repairedItems.some((item, index) => item !== table.items[index]);

  if (
    repairedName === table.name &&
    repairedType === table.type &&
    !itemsChanged
  ) {
    return table;
  }

  return {
    ...table,
    name: repairedName,
    type: repairedType,
    items: repairedItems,
  };
}

export function repairSyncedTables(tables) {
  return Array.isArray(tables) ? tables.map(repairSyncedTable) : tables;
}

export function repairSyncedMenuItem(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const canonical = MENU_CANONICAL_BY_ID.get(item.id);

  if (!canonical) {
    return item;
  }

  const repairedName = repairVietnameseText(item.name, canonical.name);

  if (repairedName === item.name) {
    return item;
  }

  return {
    ...item,
    name: repairedName,
  };
}

export function repairSyncedMenu(menu) {
  return Array.isArray(menu) ? menu.map(repairSyncedMenuItem) : menu;
}
