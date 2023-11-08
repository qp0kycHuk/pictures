import showPass from './show-pass'
import theme from './theme'
import fancybox from './fancybox'
import phonemask from './phonemask/phonemask'
import scrollTo from './scrollTo'
import swiper from './swiper'
import tab from 'npm-kit-tab'
import toggle from 'npm-kit-toggle'
import ripple from '@qpokychuk/ripple'

import 'swiper/css'
import 'swiper/css/controller'
import 'swiper/css/pagination'
import '../scss/index.scss'

window.addEventListener('DOMContentLoaded', () => loadHandler())

function loadHandler() {
  showPass.init()
  scrollTo.init()
  tab.init()
  toggle.init()
  ripple.init()
  theme.init()
  fancybox.init()
  phonemask.init('[type="tel"]')
  // effects.init()
  swiper.init()

  ripple.attach('.btn')
  ripple.attach('.waved')
  ripple.deAttach('.btn-text')
  window.addEventListener('toggleopen', toggleopenHaandler)
  window.addEventListener('toggleclose', togglecloseHaandler)

  window.addEventListener('scroll', scrollHandler)
  scrollHandler()

  checkGrid(document.querySelector('.catalog-grid'))
  checkGrid(document.querySelector('.catalog-grid'))
}

function toggleopenHaandler(event: any) {
  if (event.detail.target.classList.contains('menu')) {
    document.body.classList.add('menu-opened')
  }
}

function togglecloseHaandler(event: any) {
  if (event.detail.target.classList.contains('menu')) {
    document.body.classList.remove('menu-opened')
  }
}

function scrollHandler() {
  document.body.classList.toggle('scroll-top', window.scrollY < 10)
}

// Жестко подумать надо
function checkGrid($grid: HTMLElement | null, clear = false) {
  if (!$grid) {
    return
  }

  const $items = Array.from($grid.querySelectorAll('.catalog-item'))

  const gridItems: Element[][] = []
  const columnCount = +getComputedStyle($grid).columnCount

  $items.forEach(($item, index) => {
    let colIndex
    const order = $item.getAttribute('data-order')

    if (order && !clear) {
      colIndex = +order
    } else {
      colIndex = index % columnCount
      $item.setAttribute('data-order', colIndex.toString())
    }

    if (!gridItems[colIndex]) {
      gridItems[colIndex] = []
    }

    gridItems[colIndex].push($item)
  })

  $grid.innerHTML = ''
  gridItems.forEach((items) => {
    const col = document.createElement('div')

    items.forEach((item) => {
      col.appendChild(item)
    })

    $grid.appendChild(col)
  })
}
