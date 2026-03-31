/**
 * wasm-client.ts
 * Main-thread WASM client for piano note utilities.
 * Loads piano.wasm and exposes helper functions.
 */

interface WasmExports {
  parse_note: (ptr: number, len: number) => number
  calc_note_time: (dots: number) => number
  get_memory: () => number
  memory: WebAssembly.Memory
}

let exports_: WasmExports | null = null
let memory_: Uint8Array | null = null
let loadPromise: Promise<void> | null = null

export async function loadPianoWasm(): Promise<void> {
  if (exports_) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    try {
      const response = await fetch('/piano.wasm')
      const buffer = await response.arrayBuffer()
      const result = await WebAssembly.instantiate(buffer)
      exports_ = result.instance.exports as unknown as WasmExports
      memory_ = new Uint8Array(exports_.memory.buffer)
    } catch (err) {
      console.warn('[wasm-client] Failed to load piano.wasm:', err)
    }
  })()

  return loadPromise
}

/**
 * Parse a note name (e.g. "C#4") into a MIDI note number.
 * C4 = 60. Falls back to JS if WASM is not loaded.
 */
export function parseNote(name: string): number {
  if (exports_ && memory_) {
    const base = exports_.get_memory()
    const bytes = new TextEncoder().encode(name)
    memory_.set(bytes, base)
    return exports_.parse_note(base, bytes.length)
  }
  // JS fallback
  return jsParseNote(name)
}

/**
 * Calculate note duration in milliseconds from dot count.
 * 0 dots = 500ms, 1 dot = 1000ms, 2 dots = 1500ms
 */
export function calcNoteTime(dots: number): number {
  if (exports_) {
    return exports_.calc_note_time(dots)
  }
  return (dots + 1) * 500
}

/**
 * Returns true if WASM is loaded and ready.
 */
export function isWasmReady(): boolean {
  return exports_ !== null
}

// ---------------------------------------------------------------------------
// JS fallbacks
// ---------------------------------------------------------------------------

function jsParseNote(name: string): number {
  const semitones: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  }
  const letter = name[0]
  const isSharp = name.includes('#')
  const octaveChar = isSharp ? name[2] : name[1]
  const octave = parseInt(octaveChar ?? '4', 10)
  return (octave + 1) * 12 + (semitones[letter] ?? 0) + (isSharp ? 1 : 0)
}
