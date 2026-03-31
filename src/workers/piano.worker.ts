/**
 * piano.worker.ts
 * Web Worker for song auto-play scheduling.
 *
 * Receives messages from main thread:
 *   { type: 'PLAY',  song: SongItem[] }  — start playing a song
 *   { type: 'STOP' }                     — stop current playback
 *
 * Sends messages to main thread:
 *   { type: 'PLAY_NOTE', note: string }  — play this note now
 *   { type: 'DONE' }                     — song finished
 *   { type: 'STOPPED' }                  — playback was stopped
 *   { type: 'WASM_READY' }               — WASM loaded and ready
 */

// Song item can be an object {note, time}, a string token, or a number (rest)
export type SongItem =
  | { note: string; time: number }
  | string
  | number

interface WasmExports {
  parse_note: (ptr: number, len: number) => number
  calc_note_time: (dots: number) => number
  get_memory: () => number
  memory: WebAssembly.Memory
}

// ---------------------------------------------------------------------------
// WASM loader
// ---------------------------------------------------------------------------

let wasmExports: WasmExports | null = null
let wasmMemory: Uint8Array | null = null

async function loadWasm(): Promise<void> {
  try {
    const response = await fetch('/piano.wasm')
    const buffer = await response.arrayBuffer()
    const result = await WebAssembly.instantiate(buffer)
    wasmExports = result.instance.exports as unknown as WasmExports
    wasmMemory = new Uint8Array(wasmExports.memory.buffer)
    self.postMessage({ type: 'WASM_READY' })
  } catch (err) {
    console.warn('[piano.worker] WASM load failed, falling back to JS:', err)
    self.postMessage({ type: 'WASM_READY' })
  }
}

// ---------------------------------------------------------------------------
// JS fallbacks
// ---------------------------------------------------------------------------

function jsCalcNoteTime(dots: number): number {
  return (dots + 1) * 500
}

// ---------------------------------------------------------------------------
// WASM-backed helpers (with JS fallback)
// ---------------------------------------------------------------------------

function calcNoteTime(dots: number): number {
  if (wasmExports) {
    return wasmExports.calc_note_time(dots)
  }
  return jsCalcNoteTime(dots)
}

// ---------------------------------------------------------------------------
// String token parser — handles "1.", "2..", "#4", "-3", "+5", "1+3" etc.
// Mirrors the original handleString / handleStrings logic.
// ---------------------------------------------------------------------------

interface ParsedNote {
  noteName: string
  timeMs: number
}

const NOTE_MAP: Record<string, string> = {
  '1': 'C', '2': 'D', '3': 'E', '4': 'F',
  '5': 'G', '6': 'A', '7': 'B',
}

function parseSingleToken(token: string): ParsedNote {
  const subKey = (token.match(/-/g) ?? []).length
  const addKey = (token.match(/\+/g) ?? []).length
  const dotKey = (token.match(/\./g) ?? []).length
  const isSharp = token.includes('#')

  const digitMatch = token.match(/[0-9]/)
  const digit = digitMatch ? digitMatch[0] : '0'

  if (digit === '0') {
    return { noteName: '', timeMs: 1000 }
  }

  const letter = NOTE_MAP[digit] ?? 'C'
  let octave = 4
  if (subKey === 1) octave = 3
  else if (subKey === 2) octave = 2
  else if (addKey === 1) octave = 5
  else if (addKey === 2) octave = 6

  const noteName = `${letter}${isSharp ? '#' : ''}${octave}`
  const timeMs = calcNoteTime(dotKey)

  return { noteName, timeMs }
}

/**
 * Parse a compound token like "1+3" or "61" (multiple notes, play simultaneously).
 * Returns the shortest duration among all notes.
 */
function parseCompoundToken(token: string): { notes: string[]; timeMs: number } {
  // Extract all digit positions with their context
  const reg = /[0-9]/g
  let match: RegExpExecArray | null
  const positions: number[] = []

  while ((match = reg.exec(token)) !== null) {
    positions.push(match.index)
  }

  if (positions.length <= 1) {
    const parsed = parseSingleToken(token)
    return { notes: parsed.noteName ? [parsed.noteName] : [], timeMs: parsed.timeMs }
  }

  // Multiple digits: split into sub-tokens
  const subTokens: string[] = []
  for (let i = 0; i < positions.length; i++) {
    const start = i === 0 ? 0 : positions[i - 1]! + 1
    const end = positions[i]! + 1
    // Include trailing dots
    let tokenEnd = end
    while (tokenEnd < token.length && token[tokenEnd] === '.') tokenEnd++
    subTokens.push(token.slice(start, tokenEnd))
  }

  const notes: string[] = []
  const times: number[] = []

  for (const sub of subTokens) {
    const parsed = parseSingleToken(sub)
    if (parsed.noteName) notes.push(parsed.noteName)
    times.push(parsed.timeMs)
  }

  const timeMs = times.length > 0 ? Math.min(...times) : 500

  return { notes, timeMs }
}

// ---------------------------------------------------------------------------
// Playback scheduler
// ---------------------------------------------------------------------------

let stopFlag = false
let currentTimeout: ReturnType<typeof setTimeout> | null = null

function cancelPlayback(): void {
  stopFlag = true
  if (currentTimeout !== null) {
    clearTimeout(currentTimeout)
    currentTimeout = null
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    currentTimeout = setTimeout(() => {
      currentTimeout = null
      resolve()
    }, ms)
  })
}

async function playSong(song: SongItem[]): Promise<void> {
  stopFlag = false

  for (let i = 0; i < song.length; i++) {
    if (stopFlag) {
      self.postMessage({ type: 'STOPPED' })
      return
    }

    const item = song[i]
    if (item === undefined || item === null) continue

    if (typeof item === 'object' && 'note' in item) {
      // Object format: { note: 'C4', time: 500 }
      if (item.note) {
        self.postMessage({ type: 'PLAY_NOTE', note: item.note })
      }
      await sleep(item.time)

    } else if (typeof item === 'string') {
      // String token format
      const { notes, timeMs } = parseCompoundToken(item)
      for (const note of notes) {
        self.postMessage({ type: 'PLAY_NOTE', note })
      }
      await sleep(timeMs)

    } else if (typeof item === 'number') {
      // Number: rest (0 = 1000ms)
      if (item === 0) await sleep(1000)
    }
  }

  if (!stopFlag) {
    self.postMessage({ type: 'DONE' })
  }
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.addEventListener('message', (event: MessageEvent) => {
  const { type, song } = event.data as { type: string; song?: SongItem[] }

  switch (type) {
    case 'PLAY':
      if (song) {
        cancelPlayback()
        setTimeout(() => playSong(song), 10)
      }
      break

    case 'STOP':
      cancelPlayback()
      self.postMessage({ type: 'STOPPED' })
      break
  }
})

// Load WASM on worker startup
loadWasm()
