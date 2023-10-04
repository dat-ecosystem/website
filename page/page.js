/******************************************************************************
  INITIALIZE PAGE
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
config().then(boot)
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  const html = document.documentElement
  const meta = document.createElement('meta')
  const favicon = document.createElement('link')
  html.setAttribute('lang', 'en')
  favicon.setAttribute('rel', 'icon')
  favicon.setAttribute('type', 'image/png')
  favicon.setAttribute('href', 'data:image/png;base64,iVBORw0KGgo=')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  const fonts = new CSSStyleSheet()
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)
  const font1_url = path('theme/assets/fonts/Silkscreen-Regular.ttf')
  const font2_url = path('theme/assets/fonts/Silkscreen-Bold.ttf')
  fonts.replaceSync(`
  /* latin-ext */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(${font1_url}) format('truetype');
    unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  /* latin */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(${font1_url}) format('truetype');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  /* latin-ext */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(${font2_url}) format('truetype');
    unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }
  /* latin */
  @font-face {
    font-family: 'Silkscreen';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(${font2_url}) format('truetype');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  `)
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)
  document.adoptedStyleSheets = [fonts, sheet]
  document.head.append(meta, favicon)
  await document.fonts.ready
}
/******************************************************************************
  PAGE BOOT
******************************************************************************/
async function boot () {
  const desktop = require('..')
  const light_theme = require('theme/lite-theme')
  const dark_theme = require('theme/dark-theme')
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const state = STATE.ids[id] = { id, wait: {}, net: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const opts = { page: 'CONSORTIUM', theme: 'dark_theme', themes: { light_theme, dark_theme } }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.body
  const shopts = { mode: 'closed' }
  // ----------------------------------------
  const shadow = el.attachShadow(shopts)
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  const page = await desktop(opts, desktop_protocol('page', state))
  shadow.append(page)
  // ----------------------------------------
  // INIT
  // ----------------------------------------
}
function desktop_protocol (petname, state) {
  const { id } = state
  return send => {
    const on = {}
    state.aka.desktop = send.id
    const channel = state.net[send.id] = { mid: 0, send, on } // store channel
    return Object.assign(listen, { id })
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function invalid (message) { console.error('invalid type', message) }
    function listen (message) { // receive messages
      console.log(`[${id}]:${petname}>`, message)
      const { on } = channel
      const action = on[message.type] || invalid
      action(message, state)
    }
  }
}