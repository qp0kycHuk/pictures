import { Fancybox } from '@fancyapps/ui'
import { OptionsType } from '@fancyapps/ui/types/Fancybox/options'

function init() {
  window.Fancybox = Fancybox
  const options: Omit<Partial<OptionsType>, 'defaultType'> & { defaultType: string } = {
    dragToClose: false,
    mainClass: 'fancybox-custom-modal',
    defaultType: 'ajax',
    autoFocus: false,
  }

  Fancybox.bind('[data-fancybox]')
  // @ts-ignore
  Fancybox.bind('[data-fancybox-modal]', options)

  // @ts-ignore
  Fancybox.modal = {}

  // @ts-ignore
  Fancybox.modal.open = (src) => {
    // @ts-ignore
    Fancybox.show([{ src, ...options }], options)
  }
}

interface CustomWindow extends Window {
  Fancybox: typeof Fancybox
}

declare let window: CustomWindow

export default { init }
