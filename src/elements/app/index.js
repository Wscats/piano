import { define, WeElement } from 'omi'
import '../app-header'
import '../app-footer'
import '../app-piano'

define('my-app', class extends WeElement {
  render() {
    return (
      <div class="app">
        <app-header />
        <app-piano />
        <app-footer />
      </div>
    )
  }
})
