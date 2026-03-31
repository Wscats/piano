import { WeElement, define, h } from 'omi';
import type { Song, KeyboardMap, MelodyItem, PianoStore } from '../../types';
import moon from '../app-piano/songs/moon';
import keys from './keys';

/** Footer data shape. */
interface FooterData {
  title: string;
  song: Song;
  keys: KeyboardMap;
}

/**
 * Footer component displaying song notation and credits.
 * Shows the current song's keyboard shortcuts with playback highlighting.
 */
class AppFooter extends WeElement<Record<string, unknown>, FooterData> {
  declare store: PianoStore;

  /** Forward song to the store. */
  private setSong = (song: Song): void => this.store.setSong(song);

  render(): unknown {
    return h('div', { class: 'app-footer' },
      h('hr', { class: 'mt-5' }),
      h('div', { class: 'row mt-5' },
        h('div', { class: 'col' },
          h('div', { class: 'text-center' },
            h('p', { class: 'mt-4' },
              'You can click on the keyboard and play the melody that belongs to you. Here is an example of a piano piece:',
            ),
            h('p', null,
              '你可以点击键盘依顺序按以下键，控制好节奏演奏属于你的旋律，下面是一首钢琴曲的例子:',
            ),
            h('p', { class: 'mt-4' }, 'Enjoy it!'),
            this.store.data.song.map((item: MelodyItem[]) => {
              if (item[0]?.note) {
                return h('p', { class: 'mt-3 code' },
                  h('code', { class: 'p-2 text-dark' },
                    item.map((item2: MelodyItem) => {
                      if (item2.note) {
                        return h('span', {
                          style: {
                            color: this.store.data.count === item2.index ? 'red' : 'black',
                          },
                        }, this.data.keys[item2.note], ',');
                      }
                      return null;
                    }),
                  ),
                );
              }
              return null;
            }),
          ),
        ),
      ),
      h('div', { class: 'bg-yellow mt-5 py-5' },
        h('div', { class: 'container' },
          h('div', { class: 'text-center text-secondary' },
            'Made with ',
            h('span', { role: 'img', 'aria-label': 'keyboard emoji' }, '🎵'),
            'by ',
            h('a', { class: 'text-secondary', href: 'https://github.com/Wscats' },
              h('strong', null, '@Eno Yao'),
            ),
          ),
        ),
      ),
    );
  }

  /** Initialize component data and load the default song. */
  install(): void {
    this.data = {
      title: 'omi',
      song: [],
      keys,
    };
    this.setSong(moon);
  }
}

AppFooter.css = `
  hr { margin: 0 50px; border: 0; border-top: 1px solid rgba(0,0,0,0.1); box-sizing: content-box; height: 0; overflow: visible; }
  .bg-yellow { background-color: #f8e8d5; }
  .container { line-height: 50px; height: 50px; width: 100%; margin-right: auto; margin-left: auto; }
  .text-secondary { color: #6c757d !important; }
  .text-center { text-align: center !important; }
  .code { padding: 0 250px; }
  @media screen and (max-width: 1000px) { .code { padding: 0 20px; } }
  code { overflow: hidden; background-color: #ececec; width: 100%; display: block; padding: 10px 0; }
`;

AppFooter.use = [{ count: 'count', song: 'song' }];

define('app-footer', AppFooter);
