import { PianoPlayer, KEY_NOTE_MAP } from './piano-player';

describe('PianoPlayer', () => {
  let player: PianoPlayer;

  beforeEach(() => {
    (global as any).AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 0 },
        type: 'sine',
      }),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
      }),
      destination: {},
      currentTime: 0,
      close: jest.fn(),
    }));
    player = new PianoPlayer();
  });

  afterEach(() => player.destroy());

  test('initializes AudioContext', () => {
    expect(AudioContext).toHaveBeenCalledTimes(1);
  });

  test('plays note on keydown', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 65 }));
    const ctx = (AudioContext as jest.Mock).mock.results[0].value;
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  test('ignores key repeat', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 65, repeat: true }));
    const ctx = (AudioContext as jest.Mock).mock.results[0].value;
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  test('stops note on keyup', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 65 }));
    document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 65 }));
    const ctx = (AudioContext as jest.Mock).mock.results[0].value;
    const osc = ctx.createOscillator.mock.results[0].value;
    expect(osc.stop).toHaveBeenCalled();
  });

  test('KEY_NOTE_MAP has 8 entries', () => {
    expect(KEY_NOTE_MAP).toHaveLength(8);
  });
});
