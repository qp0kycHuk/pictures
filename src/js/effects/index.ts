import { Curtains } from 'curtainsjs'
import interior from './interior'

function init() {
  // set up our WebGL context and append the canvas to our wrapper
  window.addEventListener('load', () => {
    const curtains = new Curtains({
      container: 'curtains-canvas',
      antialias: false, // render targets will disable default antialiasing anyway
      pixelRatio: Math.min(1.5, window.devicePixelRatio), // limit pixel ratio for performance
    })

    interior.init(curtains)
  })
}

export default { init }
