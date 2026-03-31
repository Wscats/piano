/**
 * worker-manager.ts
 * Main-thread manager for the piano Web Worker.
 * Handles worker lifecycle, message routing, and playback control.
 */

export interface SongNote {
  note: string
  time: number
}

export type WorkerEventType = 'PLAY_NOTE' | 'DONE' | 'STOPPED' | 'WASM_READY'

export interface WorkerMessage {
  type: WorkerEventType
  note?: string
}

type NoteCallback = (note: string) => void
type DoneCallback = () => void

export class PianoWorkerManager {
  private worker: Worker | null = null
  private onPlayNote: NoteCallback | null = null
  private onDone: DoneCallback | null = null
  private onStopped: DoneCallback | null = null
  private wasmReady = false

  constructor() {
    this.init()
  }

  private init(): void {
    try {
      // Vite worker import syntax
      this.worker = new Worker(
        new URL('../workers/piano.worker.ts', import.meta.url),
        { type: 'module' }
      )
      this.worker.addEventListener('message', this.handleMessage.bind(this))
      this.worker.addEventListener('error', (e) => {
        console.error('[PianoWorkerManager] Worker error:', e)
      })
    } catch (err) {
      console.warn('[PianoWorkerManager] Worker creation failed:', err)
    }
  }

  private handleMessage(event: MessageEvent<WorkerMessage>): void {
    const { type, note } = event.data

    switch (type) {
      case 'WASM_READY':
        this.wasmReady = true
        break

      case 'PLAY_NOTE':
        if (note && this.onPlayNote) {
          this.onPlayNote(note)
        }
        break

      case 'DONE':
        if (this.onDone) {
          this.onDone()
        }
        break

      case 'STOPPED':
        if (this.onStopped) {
          this.onStopped()
        }
        break
    }
  }

  /**
   * Start playing a song. The worker will send PLAY_NOTE messages
   * for each note at the correct time.
   */
  play(song: SongNote[]): void {
    if (!this.worker) {
      console.warn('[PianoWorkerManager] No worker available')
      return
    }
    this.worker.postMessage({ type: 'PLAY', song })
  }

  /**
   * Stop the current song playback.
   */
  stop(): void {
    if (!this.worker) return
    this.worker.postMessage({ type: 'STOP' })
  }

  /**
   * Register callback for when a note should be played.
   */
  onNote(cb: NoteCallback): this {
    this.onPlayNote = cb
    return this
  }

  /**
   * Register callback for when the song finishes.
   */
  onFinish(cb: DoneCallback): this {
    this.onDone = cb
    return this
  }

  /**
   * Register callback for when playback is stopped.
   */
  onStop(cb: DoneCallback): this {
    this.onStopped = cb
    return this
  }

  /**
   * Whether the WASM module in the worker is ready.
   */
  isWasmReady(): boolean {
    return this.wasmReady
  }

  /**
   * Terminate the worker. Call when the component unmounts.
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}
