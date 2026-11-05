// Client-side persistent media storage using IndexedDB + localStorage thumbnail cache

const DB_NAME = "aranya_media_db";
const STORE_NAME = "drone_images";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function compressImage(
  source: File | string,
  maxDimension = 720,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(typeof source === "string" ? source : "");
      return;
    }

    const processSrc = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          try {
            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
            return;
          } catch {
            resolve(src);
            return;
          }
        }
        resolve(src);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };

    if (typeof source === "string") {
      processSrc(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        if (raw) processSrc(raw);
        else resolve("");
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(source);
    }
  });
}

export async function saveDroneMedia(
  id: string,
  source: File | string,
  incidentId?: string
): Promise<{ fullUrl: string; thumbUrl: string }> {
  let fullUrl = "";
  if (typeof source === "string") {
    fullUrl = source;
  } else {
    fullUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(source);
    });
  }

  // Compress thumbnail specifically for localStorage (< 50KB to avoid QuotaExceededError)
  const thumbUrl = await compressImage(fullUrl, 640, 0.65);

  // 1. Save Full-Res into IndexedDB (virtually unlimited quota)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    if (fullUrl) {
      store.put(fullUrl, id);
      store.put(fullUrl, "latest");
      if (incidentId) {
        store.put(fullUrl, `incident_${incidentId}`);
      }
    }
  } catch (err) {
    console.warn("IndexedDB save error (falling back to memory):", err);
  }

  // 2. Save compact thumbnail into localStorage for instant synchronous rendering
  if (typeof window !== "undefined" && thumbUrl) {
    try {
      localStorage.setItem(`aranya_media_${id}`, thumbUrl);
      localStorage.setItem("aranya_latest_drone_image", thumbUrl);
      if (incidentId) {
        localStorage.setItem(`aranya_drone_media_${incidentId}`, thumbUrl);
      }
    } catch {
      try {
        // Quota exceeded: clean old non-critical keys and retry
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("aranya_drone_record_") || (k.startsWith("aranya_media_") && k !== `aranya_media_${id}`)) {
            localStorage.removeItem(k);
          }
        });
        localStorage.setItem(`aranya_media_${id}`, thumbUrl);
        localStorage.setItem("aranya_latest_drone_image", thumbUrl);
      } catch (quotaErr) {
        console.warn("Storage quota exceeded even after cleanup:", quotaErr);
      }
    }
  }

  return { fullUrl, thumbUrl };
}

export function getDroneMediaSync(
  id?: string | null,
  incidentId?: string | null
): string | null {
  if (typeof window === "undefined") return null;

  if (id) {
    const direct = localStorage.getItem(`aranya_media_${id}`);
    if (direct) return direct;
  }
  if (incidentId) {
    const inc = localStorage.getItem(`aranya_drone_media_${incidentId}`);
    if (inc) return inc;
  }
  return localStorage.getItem("aranya_latest_drone_image");
}

export async function getDroneMediaAsync(
  id?: string | null,
  incidentId?: string | null
): Promise<string | null> {
  const syncFallback = getDroneMediaSync(id, incidentId);
  if (typeof window === "undefined" || !window.indexedDB) return syncFallback;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const checkKey = (key: string, next: () => void) => {
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result) resolve(req.result);
          else next();
        };
        req.onerror = () => next();
      };

      const step1 = () => {
        if (id) checkKey(id, step2);
        else step2();
      };
      const step2 = () => {
        if (incidentId) checkKey(`incident_${incidentId}`, step3);
        else step3();
      };
      const step3 = () => {
        checkKey("latest", () => resolve(syncFallback));
      };

      step1();
    });
  } catch {
    return syncFallback;
  }
}
