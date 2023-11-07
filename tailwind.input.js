const plugin = require('tailwindcss/plugin')
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')
const { parseColor, formatColor } = require('tailwindcss/lib/util/color')

const defaultOptions = {
  className: 'input',
  disabledOpacity: 0.6,
  // colorHoverOffset: 25,
  // lightColorOpacity: 0.1,
  // lightColorOpacityHover: 0.2,
  // transition: '.2s ease',
  // withFocusStyles: false,
  // targetGroupSelector: '.btn-group',
  // targetPeerSelector: '.btn-peer',
  baseCss: {},
}

module.exports = plugin.withOptions(
  (opts) =>
    function ({ addComponents, matchUtilities, addBase, theme }) {
      const sizeName = '--tw-input-size'
      const colorName = '--tw-input-color'
      const sizeVar = 'var(--tw-input-size)'
      const colorVar = 'var(--tw-input-color)'
      const options = {
        ...defaultOptions,
        ...opts,
      }
      options.className = options.className.trim()
      addBase({
        ':root': {
          [sizeName]: theme('inputSize.base'),
          [colorName]: theme('colors.primary'),
        },
      })
      addComponents({
        [`.${options.className}`]: {
          display: 'block',
          height: sizeVar,
          border: "1px solid theme('colors.black / 40%')",
          outline: 'none !important',
          lineHeight: '1',
          padding: 'calc((var(--tw-input-size) - 1.2em) / 2) 15px',
          ...options.baseCss,

          '&:is(.dark &)': {
            borderColor: "theme('colors.white / 40%')",
            background: "theme('colors.dark.100')",
            color: '#fff',
          },

          '&:focus, &:focus-within, &:is(.dark &):focus, &:is(.dark &):focus-within': {
            borderColor: colorVar,
            boxShadow: '0 0 0 1px ' + colorVar,
            zIndex: 2,
          },

          '&:disabled': {
            opacity: options.disabledOpacity,
          },
        },
      })

      // size
      matchUtilities(
        {
          [options.className]: (size) => {
            // check is not color
            const string = size.DEFAULT || size[500] || size
            const parsed = parseColor(string)
            if (!!parsed?.color) return null

            return { [sizeName]: size }
          },
        },
        { values: theme('inputSize') }
      )

      // colors
      matchUtilities(
        {
          [options.className]: (color) => {
            // check is color
            const string = color.DEFAULT || color[500] || color
            const parsed = parseColor(string)
            if (!parsed?.color) return null

            return {
              [colorName]: string,
              '--tw-btn-color-light': formatColor({
                mode: 'rgba',
                color: parsed.color,
                alpha: options.lightColorOpacity,
              }),
            }
          },
        },
        {
          values: flattenColorPalette(theme('colors')),
          type: 'color',
        }
      )
    },
  (options) => ({
    theme: {
      extend: {
        inputSize: {
          xs: '28px',
          sm: '32px',
          base: '42px',
          lg: '48px',
          xl: '56px',
          ['2xl']: '64px',
        },
      },
    },
  })
)
