import { Curtains } from 'curtainsjs'
import interior from './interior'

function init() {
  window.addEventListener('load', () => {
    const curtains = new Curtains({
      container: 'curtains-canvas',
      antialias: false,
      pixelRatio: Math.min(1.5, window.devicePixelRatio),
    })

    interior.init(curtains)
  })
}

export default { init }
