import * as fs from "fs";

type Row = { tMin: number; bpm: number };

function parseHHMMToMinutesStrict(s: string): number | null {
    const raw = s.trim();
    const m = raw.match(/^(\d{2}):(\d{2})$/); 
    if (!m) return null;

    const hh = Number.parseInt(m[1], 10);
    const mm = Number.parseInt(m[2], 10);

    if (hh < 0 || hh > 23) return null;
    if (mm < 0 || mm > 59) return null;

    return hh * 60 + mm;
}

function readCSV(csvPath: string): Row[] {
    const raw = fs.readFileSync(csvPath, "utf-8").trim();
    if (!raw) return [];

    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const rows: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
        const [timeStr, bpmStr] = lines[i].split(",").map((x) => x.trim());
        if (!timeStr || !bpmStr) continue;

        const tMin = parseHHMMToMinutesStrict(timeStr);
        const bpm = Number.parseFloat(bpmStr);

        if (tMin == null) continue;
        if (!Number.isFinite(bpm)) continue;

        rows.push({ tMin, bpm });
    }

    rows.sort((a, b) => a.tMin - b.tMin);
    return rows;
}

function floorTo10(minOfDay: number): number {
    return Math.floor(minOfDay / 10) * 10;
}

export function getHeartRateNow(csvPath: string): number | null {
    const rows = readCSV(csvPath);
    if (rows.length === 0) return null;

    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();
    const targetMin = floorTo10(curMin);

    let best: Row | null = null;
    for (const r of rows) {
        if (r.tMin <= targetMin) best = r;
        else break;
    }

    return (best ?? rows[0]).bpm;
}