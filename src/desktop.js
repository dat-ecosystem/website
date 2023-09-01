const home_page = require('home_page')
const growth_page = require('growth_page')
const timeline_page = require('timeline_page')
const projects_page = require('projects_page')
const consortium_page = require('consortium_page')
const terminal = require('terminal')
const navbar = require('navbar')

const sheet = new CSSStyleSheet()

const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')
let current_theme = light_theme
sheet.replaceSync(get_theme(current_theme))
/******************************************************************************
  DESKTOP COMPONENT
******************************************************************************/
var count = 0
const ID = __filename
const STATE = { ids: {}, hub: {} } // all state of component module
// ----------------------------------------
const default_opts = { page: 'HOME' }

module.exports = desktop

async function desktop (opts = default_opts, protocol) {
  // ----------------------------------------
  // INSTANCE STATE & ID
  const id = `${ID}:${count++}` // assigns their own name
  const state = STATE.ids[id] = { wait: {}, hub: {}, aka: {} } // all state of component instance
  // ----------------------------------------
  // ----------------------------------------
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div')
  const sh = el.attachShadow({ mode: 'closed' })
  sh.innerHTML = `
    <div class="navbar"></div>
    <div class="content"></div>
    <div class="shell"></div>
  `
  sh.adoptedStyleSheets = [sheet]
  const [nav, content, terminal_wrapper] = sh.children
  // ----------------------------------------
  // NAVBAR
  // ----------------------------------------
  const PROTOCOL = {
    'active_page': 'HOME', // @TODO: remove
    'handle_page_change': function handle_page_change (msg) {
      console.log({msg})
      const { data: active_page } = msg
      // const [to] = head
      // const
      //   PROTOCOL.active_page = active_page;
      content_sh.replaceChildren(page_list[active_page])
      //   current_page = page_list[active_page]
      const message = {
        head: ['root', 'navbar', 'navbar'],
        type: 'theme',
        data: active_page,
      }
      const { send } = state.hub[state.aka.navbar]
      send(message)
    },
    'handle_theme_change': function handle_theme_change () {
      ;current_theme = current_theme === light_theme ? dark_theme : light_theme
      sheet.replaceSync(get_theme(current_theme))
    },
    'toggle_terminal': function toggle_terminal () {
      if (terminal_sh.contains(terminal_el)) return terminal_el.remove()
      terminal_sh.append(terminal_el)
    }
  }
  const navbar_opts = { page: opts.page, data: current_theme }
  nav.attachShadow({ mode: 'closed' }).append(navbar(navbar_opts, navbar_protocol))
  function navbar_protocol (send) {
    // const on = { 'ask-opts': on_ask_opts }
    state.hub[send.id] = { mid: 0, send, on: PROTOCOL }
    state.aka.navbar = send.id
    return Object.assign(listen, { id })
    function invalid (message) { console.error('invalid type', message) }
    function listen (message) {
      console.log(`[${id}]`, message)
      const { on } = state.hub[state.aka.navbar]
      const action = on[message.type] || invalid
      action(message)
    }
  }
  // ----------------------------------------
  // CONTENT
  // ----------------------------------------
  const page_list = {
    // @TODO: maybe only store "factories" and create instance on demand?
    'HOME': home_page({ data: current_theme }),
    'PROJECTS': projects_page({ data: current_theme }),
    'GROWTH PROGRAM': growth_page({ data: current_theme }),
    'TIMELINE': timeline_page({ data: current_theme }),
    'DEFAULT': consortium_page({ data: current_theme }),
  } // @INFO: the initial visible content is set when receiving the first navbar message
  const content_sh = content.attachShadow({ mode: 'closed' })
  // ----------------------------------------
  // TERMINAL
  // ----------------------------------------
  const terminal_sh = terminal_wrapper.attachShadow({ mode: 'closed' })
  const terminal_el = terminal({ data: current_theme })
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  let current_page = consortium_page({ data: current_theme }) // Default Page
  PROTOCOL.handle_page_change({ data: 'DEFAULT' })
  // ----------------------------------------
  return el
}

function get_theme (opts) {
  return`
    :host { 
      --bg_color: ${opts.bg_color};
      --ac-1: ${opts.ac_1};
      --ac-2: ${opts.ac_2};
      --ac-3: ${opts.ac_3};
      --primary_color: ${opts.primary_color};
      font-family: Silkscreen;
      color: var(--primary_color);
      background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
      background-size: 16px 16px;
      width: 100vw;
      height: 100vh;
      position: fixed;
    }
    svg {
      fill: var(--bg_color);
    }
  `
}