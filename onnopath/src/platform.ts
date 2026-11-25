"use client";

export type ThemeChoice = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "onnopath-color-scheme";

let popoverLoaded = false;
let focusGroupLoaded = false;

export function ensurePopoverPolyfill() {
  if (popoverLoaded || typeof HTMLElement === "undefined") return;
  if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
    popoverLoaded = true;
    void import("@oddbird/popover-polyfill").catch(() => {
      popoverLoaded = false;
    });
  }
}

export function ensureFocusGroupPolyfill() {
  if (focusGroupLoaded || typeof HTMLElement === "undefined") return;
  if (!Object.hasOwn(HTMLElement.prototype, "focusGroup")) {
    focusGroupLoaded = true;
    void import("@microsoft/focusgroup-polyfill")
      .then((mod) => {
        mod.polyfillBodyAndObserve();
      })
      .catch(() => {
        focusGroupLoaded = false;
      });
  }
}

export function readStoredTheme(): ThemeChoice {
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === "light" || val === "dark") return val;
  } catch {}
  return "system";
}

export function applyThemeChoice(choice: ThemeChoice) {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (choice === "system") {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {}
    if (meta) meta.content = "light dark";
  } else {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {}
    if (meta) meta.content = choice;
  }
}

export function attachClosedByFallback(
  dialog: HTMLDialogElement,
  onDismiss: () => void,
) {
  if ("closedBy" in HTMLDialogElement.prototype) return () => {};
  const isOutside = (e: PointerEvent) => {
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };
  let pressedOutside = false;
  const onDown = (e: PointerEvent) => {
    pressedOutside = isOutside(e);
  };
  const onUp = (e: PointerEvent) => {
    if (pressedOutside && isOutside(e)) onDismiss();
    pressedOutside = false;
  };
  dialog.addEventListener("pointerdown", onDown);
  dialog.addEventListener("pointerup", onUp);
  return () => {
    dialog.removeEventListener("pointerdown", onDown);
    dialog.removeEventListener("pointerup", onUp);
  };
}

