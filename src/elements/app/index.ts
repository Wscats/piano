import { define, WeElement } from 'omi';
import '../app-header';
import '../app-footer';
import '../app-piano';

/** Root application component that composes header, piano, and footer. */
class MyApp extends WeElement {
  render(): unknown {
    return (
      <div class="app">
        <app-header />
        <app-piano />
        <app-footer />
      </div>
    );
  }
}

define('my-app', MyApp);
