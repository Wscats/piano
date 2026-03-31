/**
 * generate-wasm.js
 * Generates piano.wasm using raw WebAssembly binary encoding.
 *
 * Exported functions:
 *   parse_note(notePtr: i32, len: i32) -> i32   — note name string in memory → MIDI number
 *   calc_note_time(dots: i32) -> i32             — dot count → duration in ms
 *   get_memory() -> i32                          — returns base memory offset for string writes
 */

const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Minimal WAT-like builder using raw WASM binary encoding
// ---------------------------------------------------------------------------

function u32leb(n) {
  const out = []
  do {
    let byte = n & 0x7f
    n >>>= 7
    if (n !== 0) byte |= 0x80
    out.push(byte)
  } while (n !== 0)
  return out
}

function i32leb(n) {
  const out = []
  let more = true
  while (more) {
    let byte = n & 0x7f
    n >>= 7
    if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0)) {
      more = false
    } else {
      byte |= 0x80
    }
    out.push(byte)
  }
  return out
}

function encodeString(s) {
  const bytes = Buffer.from(s, 'utf8')
  return [...u32leb(bytes.length), ...bytes]
}

function section(id, content) {
  return [id, ...u32leb(content.length), ...content]
}

function vec(items) {
  const flat = items.flat()
  return [...u32leb(items.length), ...flat]
}

// ---------------------------------------------------------------------------
// Build the WASM module
// ---------------------------------------------------------------------------

// Type section: define function signatures
// (i32, i32) -> i32   for parse_note
// (i32) -> i32        for calc_note_time
// () -> i32           for get_memory
const typeSection = section(0x01, [
  ...vec([
    // type 0: (i32, i32) -> i32
    [0x60, ...u32leb(2), 0x7f, 0x7f, ...u32leb(1), 0x7f],
    // type 1: (i32) -> i32
    [0x60, ...u32leb(1), 0x7f, ...u32leb(1), 0x7f],
    // type 2: () -> i32
    [0x60, ...u32leb(0), ...u32leb(1), 0x7f],
  ])
])

// Memory section: 1 page (64KB)
const memorySection = section(0x05, [
  ...vec([[0x00, ...u32leb(1)]])
])

// Export section: export memory + 3 functions
const exportSection = section(0x07, [
  ...vec([
    [...encodeString('memory'), 0x02, ...u32leb(0)],
    [...encodeString('parse_note'), 0x00, ...u32leb(0)],
    [...encodeString('calc_note_time'), 0x00, ...u32leb(1)],
    [...encodeString('get_memory'), 0x00, ...u32leb(2)],
  ])
])

// Function section: 3 functions with type indices
const functionSection = section(0x03, [
  ...vec([
    u32leb(0), // parse_note: type 0
    u32leb(1), // calc_note_time: type 1
    u32leb(2), // get_memory: type 2
  ])
])

// ---------------------------------------------------------------------------
// Code section
// ---------------------------------------------------------------------------
// Memory layout:
//   offset 0x100 (256): string input buffer (up to 8 bytes)
//   offset 0x200 (512): note name lookup table (ASCII encoded)
//
// parse_note logic (simplified, handles C D E F G A B + optional # + octave):
//   reads bytes from memory[ptr..ptr+len]
//   returns MIDI note number (C4 = 60)
//
// We encode the logic as a sequence of WASM instructions.

// Helper: i32.const
const I32_CONST = (n) => [0x41, ...i32leb(n)]
// local.get
const LOCAL_GET = (i) => [0x20, ...u32leb(i)]
// local.set
const LOCAL_SET = (i) => [0x21, ...u32leb(i)]
// local.tee
const LOCAL_TEE = (i) => [0x22, ...u32leb(i)]
// i32.load8_u  offset=0 align=0
const LOAD8_U = (offset) => [0x2d, 0x00, ...u32leb(offset)]
// i32.add
const I32_ADD = [0x6a]
// i32.sub
const I32_SUB = [0x6b]
// i32.mul
const I32_MUL = [0x6c]
// i32.eq
const I32_EQ = [0x46]
// i32.ne
const I32_NE = [0x47]
// i32.lt_s
const I32_LT_S = [0x48]
// i32.gt_s
const I32_GT_S = [0x4a]
// i32.ge_s
const I32_GE_S = [0x4e]
// i32.le_s
const I32_LE_S = [0x4c]
// select
const SELECT = [0x1b]
// return
const RETURN = [0x0f]
// end
const END = [0x0b]
// block
const BLOCK = (type, body) => [0x02, type, ...body, 0x0b]
// loop
const LOOP = (type, body) => [0x03, type, ...body, 0x0b]
// br
const BR = (depth) => [0x0c, ...u32leb(depth)]
// br_if
const BR_IF = (depth) => [0x0d, ...u32leb(depth)]
// if/else/end
const IF = (type, then, els) => els
  ? [0x04, type, ...then, 0x05, ...els, 0x0b]
  : [0x04, type, ...then, 0x0b]
// i32.and
const I32_AND = [0x71]
// i32.or
const I32_OR = [0x72]
// drop
const DROP = [0x1a]
// nop
const NOP = [0x01]

// void type for block/if
const VOID = 0x40

/**
 * parse_note(ptr: i32, len: i32) -> i32
 * locals: [ptr, len, note_base, octave, is_sharp, byte0, byte1]
 * local indices: 0=ptr, 1=len, 2=note_base, 3=octave, 4=is_sharp, 5=b0, 6=b1
 *
 * Algorithm:
 *   b0 = mem[ptr]          // first char: note letter
 *   note_base = letter_to_semitone(b0)
 *   is_sharp = 0
 *   if len >= 2:
 *     b1 = mem[ptr+1]
 *     if b1 == '#': is_sharp=1, octave = mem[ptr+2] - '0'
 *     else: octave = b1 - '0'
 *   else: octave = 4
 *   return (octave+1)*12 + note_base + is_sharp
 *
 * letter_to_semitone: C=0,D=2,E=4,F=5,G=7,A=9,B=11
 */
function buildParseNote() {
  // locals: 5 extra i32s (note_base, octave, is_sharp, b0, b1)
  const locals = [[5, 0x7f]] // 5 locals of type i32

  const body = [
    // b0 = mem[ptr]  (local 5)
    ...LOCAL_GET(0), ...LOAD8_U(0), ...LOCAL_SET(5),

    // note_base = letter_to_semitone(b0)
    // C=67, D=68, E=69, F=70, G=71, A=65, B=66 (ASCII uppercase)
    // We use a chain of if-else via select tricks
    // note_base (local 2) = 0 initially
    ...I32_CONST(0), ...LOCAL_SET(2),

    // if b0 == 'C' (67): note_base = 0
    ...LOCAL_GET(5), ...I32_CONST(67), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(0), ...LOCAL_SET(2)]),

    // if b0 == 'D' (68): note_base = 2
    ...LOCAL_GET(5), ...I32_CONST(68), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(2), ...LOCAL_SET(2)]),

    // if b0 == 'E' (69): note_base = 4
    ...LOCAL_GET(5), ...I32_CONST(69), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(4), ...LOCAL_SET(2)]),

    // if b0 == 'F' (70): note_base = 5
    ...LOCAL_GET(5), ...I32_CONST(70), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(5), ...LOCAL_SET(2)]),

    // if b0 == 'G' (71): note_base = 7
    ...LOCAL_GET(5), ...I32_CONST(71), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(7), ...LOCAL_SET(2)]),

    // if b0 == 'A' (65): note_base = 9
    ...LOCAL_GET(5), ...I32_CONST(65), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(9), ...LOCAL_SET(2)]),

    // if b0 == 'B' (66): note_base = 11
    ...LOCAL_GET(5), ...I32_CONST(66), ...I32_EQ,
    ...IF(VOID, [...I32_CONST(11), ...LOCAL_SET(2)]),

    // is_sharp = 0 (local 4)
    ...I32_CONST(0), ...LOCAL_SET(4),

    // octave = 4 (local 3, default)
    ...I32_CONST(4), ...LOCAL_SET(3),

    // if len >= 2:
    ...LOCAL_GET(1), ...I32_CONST(2), ...I32_GE_S,
    ...IF(VOID, [
      // b1 = mem[ptr+1]  (local 6)
      ...LOCAL_GET(0), ...I32_CONST(1), ...I32_ADD, ...LOAD8_U(0), ...LOCAL_SET(6),

      // if b1 == '#' (35): is_sharp=1, octave = mem[ptr+2]-'0'
      ...LOCAL_GET(6), ...I32_CONST(35), ...I32_EQ,
      ...IF(VOID,
        [
          ...I32_CONST(1), ...LOCAL_SET(4),
          // octave = mem[ptr+2] - '0'
          ...LOCAL_GET(0), ...I32_CONST(2), ...I32_ADD, ...LOAD8_U(0),
          ...I32_CONST(48), ...I32_SUB, ...LOCAL_SET(3),
        ],
        [
          // else: octave = b1 - '0'
          ...LOCAL_GET(6), ...I32_CONST(48), ...I32_SUB, ...LOCAL_SET(3),
        ]
      ),
    ]),

    // return (octave+1)*12 + note_base + is_sharp
    ...LOCAL_GET(3), ...I32_CONST(1), ...I32_ADD,
    ...I32_CONST(12), ...I32_MUL,
    ...LOCAL_GET(2), ...I32_ADD,
    ...LOCAL_GET(4), ...I32_ADD,
    RETURN,
    END,
  ].flat()

  return encodeFunction(locals, body)
}

/**
 * calc_note_time(dots: i32) -> i32
 * dots=0 → 500ms, dots=1 → 1000ms, dots=2 → 1500ms
 */
function buildCalcNoteTime() {
  const locals = []
  const body = [
    // result = (dots + 1) * 500
    ...LOCAL_GET(0), ...I32_CONST(1), ...I32_ADD,
    ...I32_CONST(500), ...I32_MUL,
    RETURN,
    END,
  ].flat()
  return encodeFunction(locals, body)
}

/**
 * get_memory() -> i32
 * Returns base offset 256 for string writes
 */
function buildGetMemory() {
  const locals = []
  const body = [
    ...I32_CONST(256),
    RETURN,
    END,
  ].flat()
  return encodeFunction(locals, body)
}

function encodeFunction(locals, body) {
  // locals: array of [count, type]
  const localVec = vec(locals.map(([count, type]) => [...u32leb(count), type]))
  const content = [...localVec, ...body]
  return [...u32leb(content.length), ...content]
}

// Code section
const codeSection = section(0x0a, [
  ...vec([
    buildParseNote(),
    buildCalcNoteTime(),
    buildGetMemory(),
  ])
])

// Assemble full WASM binary
const magic = [0x00, 0x61, 0x73, 0x6d] // \0asm
const version = [0x01, 0x00, 0x00, 0x00]

const wasmBytes = Buffer.from([
  ...magic,
  ...version,
  ...typeSection,
  ...functionSection,
  ...memorySection,
  ...exportSection,
  ...codeSection,
])

// Validate by instantiating in Node.js
async function main() {
  try {
    const mod = await WebAssembly.instantiate(wasmBytes)
    const { parse_note, calc_note_time, get_memory, memory } = mod.instance.exports

    // Quick smoke tests
    const mem = new Uint8Array(memory.buffer)
    const base = get_memory()

    function writeNote(name) {
      const bytes = Buffer.from(name, 'utf8')
      for (let i = 0; i < bytes.length; i++) mem[base + i] = bytes[i]
      return parse_note(base, bytes.length)
    }

    const tests = [
      ['C4', 60], ['D4', 62], ['E4', 64], ['F4', 65],
      ['G4', 67], ['A4', 69], ['B4', 71],
      ['C#4', 61], ['A#4', 70], ['G#4', 68],
      ['C5', 72], ['C3', 48],
    ]

    let passed = 0
    for (const [note, expected] of tests) {
      const got = writeNote(note)
      if (got === expected) {
        passed++
      } else {
        console.error(`FAIL parse_note("${note}"): expected ${expected}, got ${got}`)
      }
    }
    console.log(`parse_note: ${passed}/${tests.length} tests passed`)

    const timeTests = [[0, 500], [1, 1000], [2, 1500]]
    let tPassed = 0
    for (const [dots, expected] of timeTests) {
      const got = calc_note_time(dots)
      if (got === expected) tPassed++
      else console.error(`FAIL calc_note_time(${dots}): expected ${expected}, got ${got}`)
    }
    console.log(`calc_note_time: ${tPassed}/${timeTests.length} tests passed`)

    // Write output
    const outDir = path.join(__dirname, '../public')
    const outPath = path.join(outDir, 'piano.wasm')
    fs.writeFileSync(outPath, wasmBytes)
    console.log(`✓ Written ${wasmBytes.length} bytes to ${outPath}`)
  } catch (e) {
    console.error('WASM generation failed:', e)
    process.exit(1)
  }
}

main()
