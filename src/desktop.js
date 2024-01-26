const home_page = require('home-page')
const dat_garden_page = require('dat-garden')
const timeline_page = require('timeline-page')
const projects_page = require('projects-page')
const info_page = require('info-page/info-page')
const terminal = require('terminal')
const navbar = require('navbar')
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
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const default_opts = { page: 'HOME' }
const shopts = { mode: 'closed' }
// ----------------------------------------
module.exports = desktop
// ----------------------------------------
async function desktop (opts = default_opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const cache = resources({})
  var current_theme
  // ----------------------------------------
  // OPTS
  // ----------------------------------------
  const { page, theme, themes } = opts
  const { light_theme, dark_theme } = themes
  current_theme = themes[theme]
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {}
  const channel = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `<div class="desktop">
    <div class="navbar"></div>
    <div class="content"></div>
    <div class="shell"></div>
  </div>`
  // ----------------------------------------
  const navbar_sh = shadow.querySelector('.navbar').attachShadow(shopts)
  const content_sh = shadow.querySelector('.content').attachShadow(shopts)
  const terminal_sh = shadow.querySelector('.shell').attachShadow(shopts)
  const content = shadow.querySelector('.content')
  // ----------------------------------------
  // RESOURCE POOL (can't be serialized)
  // ----------------------------------------
  const navigate = cache({
    HOME, PROJECTS, DAT_GARDEN, TIMELINE, INFO
  })
  const widget = cache({ TERMINAL })
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  { // navbar
    const on = {
      'social': on_social,
      'handle_page_change': on_navigate_page,
      'handle_theme_change': on_theme,
      'toggle_terminal': on_toggle_terminal,
    }
    const protocol = use_protocol('navbar')({ state, on })
    const opts = { page, data: current_theme } // @TODO: SET DEFAULTS -> but change to LOAD DEFAULTS
    const element = navbar(opts, protocol)
    navbar_sh.append(element)
  }
  if(screen.width < 900)
    content.onscroll = on_scroll
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  return el

  function on_scroll () {
    const nav_channel = state.net[state.aka.navbar]
    nav_channel.send({
      head: [id, nav_channel.send.id, nav_channel.mid++],
      type: 'close_navmenu',
    })
  }
  function on_social (message) {
    console.log('@TODO: open ', message.data)
  }
  function on_navigate_page (msg) {
    const { data: active_page } = msg
    const page = navigate(active_page)
    content_sh.replaceChildren(page)
    content.scrollTop = 0
  }
  function on_navigate (msg) {
    on_navigate_page(msg)
    const { data: active_page } = msg
    const nav_channel = state.net[state.aka.navbar]
    nav_channel.send({
      head: [id, nav_channel.send.id, nav_channel.mid++],
      type: 'change_highlight',
      data: active_page
    })
    const content = shadow.querySelector('.content')
    content.scrollTop = 0
  }
  function on_theme () {
    current_theme = current_theme === light_theme ? dark_theme : light_theme
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'theme_change',
      data: current_theme
    })
  }
  function on_toggle_terminal () {
    const has_terminal = status.terminal
    status.terminal = !has_terminal
    const channel = state.net[state.aka.navbar]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'toggle_terminal',
    })
    if (has_terminal) return terminal_sh.replaceChildren()
    terminal_sh.append(widget('TERMINAL'))
  }
  function open_important_documents () {
    const consortium_channel = state.net[state.aka.info_page]
    consortium_channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'open_important_documents'
    })
  }
  function HOME () {
    const on = {
      'navigate': on_navigate,
      'open_important_documents': open_important_documents
    }
    const protocol = use_protocol('home_page')({ state, on })
    const opts = { data: current_theme }
    const element = home_page(opts, protocol)
    return element
  }
  function PROJECTS () {
    const on = {}
    const protocol = use_protocol('projects_page')({ state, on })
    const opts = { data: current_theme }
    const element = projects_page(opts, protocol)
    return element
  } 
  function DAT_GARDEN () {
    const on = {}
    const protocol = use_protocol('dat_garden_page')({ state, on })
    const opts = { data: current_theme }
    const element = dat_garden_page(opts, protocol)
    return element
  }
  function TIMELINE () {
    const on = {}
    const protocol = use_protocol('timeline_page')({ state, on })
    const opts = { data: current_theme }
    const element = timeline_page(opts, protocol)
    return element
  }
  function INFO () {
    const on = {}
    const protocol = use_protocol('info_page')({ state, on })
    const opts = { data: current_theme }
    const element = info_page(opts, protocol)
    return element
  }
  function TERMINAL () {
    const on = {
      'toggle_terminal': on_toggle_terminal,
      'navigate': on_navigate,
    }
    const protocol = use_protocol('terminal')({ state, on })
    const opts = { data: current_theme }
    const element = terminal(opts, protocol)
    return element
  }
}
function get_theme (opts) {
  return`
    * { box-sizing: border-box; }
    body {
        overscroll-behavior: contain;
    }
    :host {
      display: flex;
      flex-direction: column;
      font-family: Silkscreen;
      color: var(--primary_color);
      background-image: radial-gradient(var(--bg_color_3) 1px, var(--bg_color_2) 2px);
      background-size: 8px 8px;
      height: 100vh;
    }
    svg {
      fill: var(--bg_color_2);
    }
    .desktop {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      height:100%;
      overflow-x: scroll;
      scrollbar-width: none;
    }
    ::-webkit-scrollbar {
      display: none;
    }
    .shell {
      flex-grow: 1;
    }
  `
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