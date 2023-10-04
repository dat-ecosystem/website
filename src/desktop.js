const home_page = require('home-page')
const growth_page = require('dat-garden')
const timeline_page = require('timeline-page')
const projects_page = require('projects-page')
const consortium_page = require('consortium-page')
const terminal = require('terminal')
const navbar = require('navbar')

const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')
let current_theme = light_theme

const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme(current_theme))
/******************************************************************************
  DESKTOP COMPONENT
******************************************************************************/
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
// ----------------------------------------
const default_opts = { page: 'HOME' }

module.exports = desktop

async function desktop (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const pool = {}
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const sh = el.attachShadow({ mode: 'closed' })
  sh.innerHTML = `<div class="desktop">
    <div class="navbar"></div>
    <div class="content"></div>
    <div class="shell"></div>
  </div>`
  sh.adoptedStyleSheets = [sheet]
  const shopts = { mode: 'closed' }
  const navbar_sh = sh.querySelector('.navbar').attachShadow(shopts)
  const content_sh = sh.querySelector('.content').attachShadow(shopts)
  const terminal_sh = sh.querySelector('.shell').attachShadow(shopts)
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const cache = resources(pool)
  const navigation = cache({
    'HOME': () => home_page({ data: current_theme }),
    'PROJECTS': () => projects_page({ data: current_theme }),
    'GROWTH PROGRAM': () => growth_page({ data: current_theme }),
    'TIMELINE': () => timeline_page({ data: current_theme }),
    'CONSORTIUM': () => consortium_page({ data: current_theme }),
  })
  const widgets = cache({
    'terminal': () => terminal({ data: current_theme })
  })
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  const navbar_opts = { page: opts.page, data: current_theme } // @TODO: SET DEFAULTS -> but change to LOAD DEFAULTS
  navbar_sh.append(navbar(navbar_opts, navbar_protocol))
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function navbar_protocol (send) {
    // const on = { 'ask-opts': on_ask_opts }
    const on = {
      'social': onsocial,
      'handle_page_change': on_navigate,
      'handle_theme_change': on_theme,
      'toggle_terminal': on_toggle,
    }
    // --------------------------
    state.net[send.id] = { mid: 0, send, on }
    state.aka.navbar = send.id
    return Object.assign(listen, { id })
    function invalid (message) { console.error('invalid type', message) }
    function listen (message) {
      console.log(`[${id}]`, message)
      const { on } = state.net[state.aka.navbar]
      const action = on[message.type] || invalid
      action(message)
    }
    // --------------------------
    function onsocial (message) {
      console.log('@TODO: open ', message.data)
    }
    function on_navigate (msg) {
      const { data: active_page } = msg
      const page = navigation(active_page)
      content_sh.replaceChildren(page)
    }
    function on_theme () {
      ;current_theme = current_theme === light_theme ? dark_theme : light_theme
      sheet.replaceSync(get_theme(current_theme))
    }
    function on_toggle () {
      const has_terminal = status.terminal
      status.terminal = !has_terminal
      if (has_terminal) return terminal_sh.replaceChildren()
      terminal_sh.append(widgets('terminal'))
    }
  }
}
function get_theme (opts) {
  return`
    * { box-sizing: border-box; }
    :host {
      --bg_color: ${opts.bg_color};
      --ac-1: ${opts.ac_1};
      --ac-2: ${opts.ac_2};
      --ac-3: ${opts.ac_3};
      --primary_color: ${opts.primary_color};
      display: flex;
      flex-direction: column;
      font-family: Silkscreen;
      color: var(--primary_color);
      background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
      background-size: 16px 16px;
      height: 100vh;
    }
    svg {
      fill: var(--bg_color);
    }
    .desktop {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      overflow-x: scroll;
    }
    .shell {
      flex-grow: 1;
    }
  `
}
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