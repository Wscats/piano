import { define, WeElement } from 'omi'
import '../app-piano'

define('my-app', class extends WeElement {
  render() {
    return (
      <div class="app">
        <app-piano />
      </div>
    )
  }
})
