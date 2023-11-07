class Counter extends HTMLElement {
  min = 0
  max = 0
  value = 0
  inputEl: HTMLInputElement
  minusButton: HTMLButtonElement
  plusButton: HTMLButtonElement

  constructor() {
    super()

    this.inputEl = document.createElement('input')
    this.inputEl.className = 'bg-light absolute inset-0 w-full h-full text-center'
    this.inputEl.addEventListener('input', this.changeHandler.bind(this))

    this.minusButton = document.createElement('button')
    this.minusButton.className = 'btn btn-sm btn-icon'
    this.minusButton.innerHTML = '-'
    this.minusButton.addEventListener('click', this.decrement.bind(this))

    this.plusButton = document.createElement('button')
    this.plusButton.className = 'btn btn-sm btn-icon ml-auto'
    this.plusButton.innerHTML = '+'
    this.plusButton.addEventListener('click', this.increment.bind(this))
  }

  setValue(value: number | string) {
    this.value = Math.max(
      this.min,
      Math.min(this.max, isNaN(parseInt(value as string)) ? 0 : parseInt(value as string))
    )
    this.inputEl.value = this.value.toString()
  }

  decrement() {
    this.setValue(this.value - 1)
  }

  increment() {
    this.setValue(this.value + 1)
  }

  changeHandler(event: Event) {
    this.setValue((event.target as HTMLInputElement)?.value || '0')
  }

  connectedCallback() {
    this.classList.add(...'bg-light flex p-2 relative gap-7'.split(' '))

    const min = parseInt(this.getAttribute('min') || '')
    const max = parseInt(this.getAttribute('max') || '')
    const value = parseInt(this.getAttribute('value') || '')

    this.min = isNaN(min) ? -Infinity : min
    this.max = isNaN(max) ? Infinity : max
    this.setValue(value)

    this.appendChild(this.inputEl)
    this.appendChild(this.minusButton)
    this.appendChild(this.plusButton)
  }

  static get observedAttributes() {
    return ['value']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
    case 'value':
      {
        this.setValue(newValue)
      }

      break
    }
  }
}

function register() {
  customElements.define('c-counter', Counter)
}

export default { register }
