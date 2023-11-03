import Swiper from 'swiper'
import { Autoplay, Controller, Navigation, Pagination } from 'swiper/modules'
import { register } from 'swiper/element/bundle'

function init() {
  register()

  // started
  {
    const contentSwiper = new Swiper('.started-content-slider', {
      modules: [Pagination, Controller, Autoplay],
      slidesPerView: 1,
      spaceBetween: 40,
      speed: 800,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.started-content-slider .slider-pagination',
        clickable: true,
        dynamicBullets: true,
      },
    })

    const imageSwiper = new Swiper('.started-image-slider', {
      modules: [Pagination, Controller],
      slidesPerView: 1,
      spaceBetween: 40,
      speed: 800,
      loop: true,
    })

    contentSwiper.controller.control = imageSwiper
    imageSwiper.controller.control = contentSwiper
  }

  // products
  {
    const contentSwiper = new Swiper('.slider-content-swiper', {
      modules: [Navigation, Pagination, Controller, Autoplay],
      slidesPerView: 1.1,
      // centeredSlides: true,
      spaceBetween: 16,
      speed: 800,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: true,
      },
      navigation: {
        prevEl: '.slider-item-prev',
        nextEl: '.slider-item-next',
      },
      breakpoints: {
        [1366 + 29.98]: {
          slidesPerView: 1,
          spaceBetween: 40,
          // centeredSlides: false,
        },
      },
    })

    const productSwiper = new Swiper('.slider-product-swiper', {
      modules: [Navigation, Pagination, Controller],
      slidesPerView: 1.1,
      // centeredSlides: true,
      spaceBetween: 16,
      speed: 800,
      loop: true,
      breakpoints: {
        [1366 + 29.98]: {
          slidesPerView: 1,
          spaceBetween: 40,
          // centeredSlides: false,
        },
      },
    })

    contentSwiper.controller.control = productSwiper
    productSwiper.controller.control = contentSwiper
  }
}

export default { init }
