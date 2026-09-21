/**
 * Demo seed for the offline showcase.
 *
 * On first load the app plants:
 *  1. A local demo account in the offline credential vault
 *     (admin@venuevue.local / PIN 1234) so sign-in works with zero network.
 *  2. A small set of mock sales, events and inventory in localStorage so the
 *     dashboard and module pages look alive during the presentation.
 */

import { cacheCredentialsForOffline } from "./offline-auth";

export const DEMO_EMAIL = "admin@venuevue.local";
export const DEMO_PIN = "1234";
export const DEMO_USER_ID = "demo-local-admin";
export const DEMO_ROLE = "admin";

const DATA_KEY = "venue-vue-demo-data";
const SEED_VERSION = "v1";
const SEED_FLAG = "venue-vue-demo-seeded";

export interface DemoSale {
  id: string;
  reference: string;
  register: string;
  cashier: string;
  total: number;
  items: number;
  at: string;
}

export interface DemoEvent {
  id: string;
  name: string;
  hall: string;
  date: string;
  guests: number;
  status: "live" | "upcoming" | "closed";
}

export interface DemoInventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export interface DemoData {
  version: string;
  seededAt: number;
  sales: DemoSale[];
  events: DemoEvent[];
  inventory: DemoInventoryItem[];
}

function buildDemoData(): DemoData {
  const today = new Date();
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const time = (hour: number, minute: number) => {
    const d = new Date(today);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return {
    version: SEED_VERSION,
    seededAt: Date.now(),
    sales: [
      { id: "s1", reference: "VV-1041", register: "Register 1", cashier: "Mia", total: 1240, items: 6, at: time(9, 12) },
      { id: "s2", reference: "VV-1042", register: "Register 2", cashier: "Jomar", total: 870.5, items: 3, at: time(10, 38) },
      { id: "s3", reference: "VV-1043", register: "Register 1", cashier: "Mia", total: 2310, items: 11, at: time(12, 4) },
      { id: "s4", reference: "VV-1044", register: "Bar Kiosk", cashier: "Ella", total: 645, items: 4, at: time(13, 27) },
      { id: "s5", reference: "VV-1045", register: "Register 2", cashier: "Jomar", total: 1580.75, items: 8, at: time(15, 2) },
      { id: "s6", reference: "VV-1046", register: "Bar Kiosk", cashier: "Ella", total: 430, items: 2, at: time(16, 45) },
    ],
    events: [
      { id: "e1", name: "Reyes Wedding Reception", hall: "Grand Hall", date: day(0), guests: 180, status: "live" },
      { id: "e2", name: "TechFest Night Market", hall: "Courtyard", date: day(0), guests: 320, status: "live" },
      { id: "e3", name: "Corporate Year-End Party", hall: "Ballroom B", date: day(3), guests: 140, status: "upcoming" },
      { id: "e4", name: "Acoustic Sessions Vol. 7", hall: "Lounge", date: day(6), guests: 90, status: "upcoming" },
      { id: "e5", name: "Sto. Niño Fiesta Dinner", hall: "Grand Hall", date: day(-2), guests: 210, status: "closed" },
    ],
    inventory: [
      { id: "i1", name: "House Blend Coffee", category: "Beverage", price: 120, stock: 86, status: "in-stock" },
      { id: "i2", name: "Caramel Latte", category: "Beverage", price: 160, stock: 42, status: "in-stock" },
      { id: "i3", name: "Sparkling Water 500ml", category: "Beverage", price: 75, stock: 9, status: "low-stock" },
      { id: "i4", name: "Cheese Platter", category: "Food", price: 450, stock: 12, status: "low-stock" },
      { id: "i5", name: "Chicken Sliders (3pc)", category: "Food", price: 280, stock: 34, status: "in-stock" },
      { id: "i6", name: "Red Wine (glass)", category: "Bar", price: 320, stock: 0, status: "out-of-stock" },
      { id: "i7", name: "Event Program Booklet", category: "Merch", price: 90, stock: 150, status: "in-stock" },
      { id: "i8", name: "Venue Vue Tote Bag", category: "Merch", price: 350, stock: 7, status: "low-stock" },
    ],
  };
}

/** Read the seeded demo data (returns a freshly built set if nothing stored). */
export function getDemoData(): DemoData {
  if (typeof window === "undefined") return buildDemoData();
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoData;
      if (parsed?.version === SEED_VERSION && Array.isArray(parsed.sales)) return parsed;
    }
  } catch {
    /* fall through to a fresh build */
  }
  return buildDemoData();
}

/**
 * Seed the demo account + mock data once per device.
 * Safe to call on every load; it is a no-op after the first run.
 */
export async function seedDemoEnvironment(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoData) : null;
    if (!parsed || parsed.version !== SEED_VERSION) {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(buildDemoData()));
    }
  } catch {
    /* storage unavailable — the app still runs with in-memory defaults */
  }

  try {
    if (window.localStorage.getItem(SEED_FLAG) === SEED_VERSION) return;
  } catch {
    return;
  }

  await cacheCredentialsForOffline({
    email: DEMO_EMAIL,
    password: DEMO_PIN,
    userId: DEMO_USER_ID,
    role: DEMO_ROLE,
  });

  try {
    window.localStorage.setItem(SEED_FLAG, SEED_VERSION);
  } catch {
    /* ignore */
  }
}

export function formatCurrency(value: number): string {
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
