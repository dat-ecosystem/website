const desktop = require('..')
const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')
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
let current_theme = light_theme
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme(current_theme))
// ----------------------------------------
config().then(() => boot({ themes: { light_theme, dark_theme } }))
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)

  const html = document.documentElement
  const meta = document.createElement('meta')
  const favicon = document.createElement('link')
  html.setAttribute('lang', 'en')
  favicon.setAttribute('rel', 'icon')
  favicon.setAttribute('type', 'image/png')
  favicon.setAttribute('href', path('theme/assets/images/logo.png'))
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  const fonts = new CSSStyleSheet()
  // @TODO: use font api and cache to avoid re-downloading the font data every time
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
  await document.fonts.ready // @TODO: investigate why there is a FOUC
}
/******************************************************************************
  PAGE BOOT
******************************************************************************/
async function boot (opts) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { page = 'CONSORTIUM', theme = 'dark_theme' } = opts
  const { light_theme, dark_theme } = opts.themes
  const themes = { light_theme, dark_theme }
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.body
  const shopts = { mode: 'closed' }
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // desktop
    const on = { 'theme_change': on_theme }
    const protocol = use_protocol('desktop')({ state, on })
    const opts = { page, theme, themes }
    const element = await desktop(opts, protocol)
    shadow.append(element)
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return

  function on_theme (message) {
    ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    sheet.replaceSync(get_theme(current_theme))
  }
}
function get_theme (opts) {
  return `
  :host {
    --bg_color: ${opts.bg_color};
    --bg_color_2: ${opts.bg_color_2};
    --bg_color_3: ${opts.bg_color_3};
    --alt_color: ${opts.alt_color};
    --dark: #000;
    --light:#fff;
    --ac-1: ${opts.ac_1};
    --ac-2: ${opts.ac_2};
    --ac-3: ${opts.ac_3};
    --primary_color: ${opts.primary_color};
    --highlight_color: ${opts.highlight_color};
    --img_robot_3: url(${opts.img_src.img_robot_3});
    --img_robot_2: url(${opts.img_src.img_robot_2});
  }`
}
// ----------------------------------------------------------------------------
function shadowfy (props = {}, sheets = []) {
  return element => {
    const el = Object.assign(document.createElement('div'), { ...props })
    const sh = el.attachShadow(shopts)
    sh.adoptedStyleSheets = sheets
    sh.append(element)
    return el
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
// ----------------------------------------------------------------------------
function resources (pool) {
  var num = 0
  return factory => {
    const prefix = num++
    const get = name => {
      const id = prefix + name
      if (pool[id]) return pool[id]
      const type = factory[name]
      return pool[id] = type()
    }
    return Object.assign(get, factory)
  }
}