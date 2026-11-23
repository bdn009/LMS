"use client";
import { useEffect, useState } from "react";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("forma-media", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("files");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function saveFile(file: File) {
  const db = await database(),
    id = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
  return "local:" + id;
}
export function useFile(src?: string) {
  const [resolved, set] = useState<{ key: string; url: string }>();
  useEffect(() => {
    if (!src?.startsWith("local:")) return;
    let active = true,
      url = "";
    database()
      .then((db) => {
        const req = db
          .transaction("files")
          .objectStore("files")
          .get(src.slice(6));
        req.onsuccess = () => {
          if (active && req.result) {
            url = URL.createObjectURL(req.result);
            set({ key: src, url });
          }
          db.close();
        };
        req.onerror = () => db.close();
      })
      .catch(() => {});
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);
  return src?.startsWith("local:")
    ? resolved?.key === src
      ? resolved.url
      : ""
    : src;
}
