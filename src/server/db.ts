import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Station, Report } from '../types/station';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATIONS_PATH = path.join(DATA_DIR, 'stations.json');
const REPORTS_PATH = path.join(DATA_DIR, 'reports.json');

/** Input shape for addReport — system-generated fields are omitted. */
export type ReportInput = Omit<Report, 'id' | 'status' | 'createdAt'>;

/* ------------------------------------------------------------------ */
/*  internal helpers                                                   */
/* ------------------------------------------------------------------ */

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

function writeJson<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readStations(): Station[] {
  return readJson<Station>(STATIONS_PATH);
}

function writeStations(stations: Station[]): void {
  writeJson(STATIONS_PATH, stations);
}

function readReports(): Report[] {
  return readJson<Report>(REPORTS_PATH);
}

function writeReports(reports: Report[]): void {
  writeJson(REPORTS_PATH, reports);
}

/** Generate a URL-safe slug from a name (kebab-case, supports Chinese). */
function generateSlug(name: string): string {
  // For Chinese names, use a timestamp-based slug; for ASCII names, kebab-case
  const ascii = name.match(/[a-zA-Z0-9]+/g);
  if (ascii && ascii.join('').length >= 2) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // Fallback for Chinese or non-ASCII names: use timestamp
  return 'station-' + Date.now().toString(36);
}

/* ------------------------------------------------------------------ */
/*  Station CRUD                                                       */
/* ------------------------------------------------------------------ */

/** Return all stations from the data file. */
export function getAllStations(): Station[] {
  return readStations();
}

/** Find a single station by its slug. */
export function getStationBySlug(slug: string): Station | undefined {
  return readStations().find((s) => s.slug === slug);
}

/** Append a new station and persist. */
export function addStation(station: Station): Station {
  const stations = readStations();
  stations.push(station);
  writeStations(stations);
  return station;
}

/** Partially update a station identified by slug. Returns undefined if not found. */
export function updateStation(slug: string, updates: Partial<Station>): Station | undefined {
  const stations = readStations();
  const index = stations.findIndex((s) => s.slug === slug);
  if (index === -1) {
    return undefined;
  }
  // Preserve the slug — it's the primary key and must not change via update.
  stations[index] = { ...stations[index], ...updates, slug: stations[index].slug };
  writeStations(stations);
  return stations[index];
}

/** Remove a station by slug. Returns true if a station was deleted. */
export function deleteStation(slug: string): boolean {
  const stations = readStations();
  const filtered = stations.filter((s) => s.slug !== slug);
  if (filtered.length === stations.length) {
    return false;
  }
  writeStations(filtered);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Report queue                                                       */
/* ------------------------------------------------------------------ */

/** Add a user-submitted report to the pending queue. */
export function addReport(input: ReportInput): Report {
  const reports = readReports();
  const report: Report = {
    ...input,
    id: randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  writeReports(reports);
  return report;
}

/** Return all reports with status 'pending'. */
export function getPendingReports(): Report[] {
  return readReports().filter((r) => r.status === 'pending');
}

/** Mark a report as approved and create a Station entry from it. Returns undefined if the report ID doesn't exist. */
export function approveReport(id: string): Report | undefined {
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return undefined;
  }

  const report = reports[index];
  report.status = 'approved';
  writeReports(reports);

  // Create a Station from the report data
  const slug = generateSlug(report.name);
  const station: Station = {
    name: report.name,
    slug,
    url: report.url,
    description: report.description,
    models: Array.isArray(report.models) ? report.models : [],
    pricing: {},
    features: ['兼容 OpenAI 格式'],
    rating: 0,
    paymentMethods: [],
    updatedAt: new Date().toISOString().split('T')[0],
  };

  const stations = readStations();
  // Avoid duplicate slug
  if (!stations.find((s) => s.slug === slug)) {
    stations.push(station);
    writeStations(stations);
  }

  return report;
}

/** Mark a report as rejected. Returns undefined if the report ID doesn't exist. */
export function rejectReport(id: string): Report | undefined {
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return undefined;
  }
  reports[index].status = 'rejected';
  writeReports(reports);
  return reports[index];
}

/** Update a report's editable fields. Returns undefined if the report ID doesn't exist. */
export function updateReport(id: string, updates: Partial<Pick<Report, 'name' | 'url' | 'description' | 'models'>>): Report | undefined {
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return undefined;
  }
  if (updates.name !== undefined) reports[index].name = updates.name;
  if (updates.url !== undefined) reports[index].url = updates.url;
  if (updates.description !== undefined) reports[index].description = updates.description;
  if (updates.models !== undefined) reports[index].models = updates.models;
  writeReports(reports);
  return reports[index];
}
