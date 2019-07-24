import { define, WeElement } from 'omi'
import '../app-omil'

define('my-app', class extends WeElement {
  render() {
    return (
      <div class="app">
        <app-omil />
      </div>
    )
  }
})
