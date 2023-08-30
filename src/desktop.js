const home_page = require('home_page')
const growth_page = require('growth_page')
const timeline_page = require('timeline_page')
const projects_page = require('projects_page')
const consortium_page = require('consortium_page')
const terminal = require('terminal')
const navbar = require('navbar')

// DEFAULT THEMES
const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')

const sheet = new CSSStyleSheet()
let current_theme = light_theme
sheet.replaceSync(get_theme(current_theme))

module.exports = desktop
/******************************************************************************
  DESKTOP COMPONENT
******************************************************************************/
function desktop (opts = {}, protocol) {
  // ----------------------------------------
  // SETUP
  // ----------------------------------------
  let notify // remove
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
    'handle_page_change': handle_page_change,
    'handle_theme_change': handle_theme_change,
    'toggle_terminal': toggle_terminal
  }
  const navbar_opts = { page: opts.page, data: current_theme }
  // nav.attachShadow({ mode: 'closed' }).append(navbar(navbar_opts, navbar_protocol))
  nav.attachShadow({ mode: 'closed' }).append(navbar(navbar_opts, page_protocol))
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
  //Default Page
  let current_page = consortium_page({data: current_theme})
  handle_page_change('DEFAULT')
  // Adding font link
  sh.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  return el
  // ----------------------------------------
  function handle_page_change (active_page) {
    //   PROTOCOL.active_page = active_page;
    content_sh.replaceChildren(page_list[active_page])
    //   current_page = page_list[active_page]
    const message = {
      head: ['root', 'navbar', 'navbar'],
      type: 'theme',
      data: active_page,
    }
    notify(message)
  }
  function handle_theme_change () {
    ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    sheet.replaceSync(get_theme(current_theme))
  }
  function toggle_terminal () {
    if (terminal_sh.contains(terminal_el)) return terminal_el.remove()
    terminal_sh.append(terminal_el)
  }
  function page_protocol (handshake, send, mid = 0) {
    notify = send

    if (send) return listen
    
    function listen (message) {        
      const { head, type, data } = message
      const {by, to, id} = head
      // if (to !== id) return console.error('address unknown', message)
      const action = PROTOCOL[type] || invalid
      action(data)
    }
    function invalid (message) { console.error('invalid type', message) }
    // async function change_theme () {
    //   // const [to] = head
    //   ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    //   sheet.replaceSync( get_theme(current_theme) )
    //   return send({
    //       // head: [id, to, mid++],
    //       // refs: { cause: head },
    //       // type: 'theme',
    //       from: 'page updated',
    //       data: current_theme
    //   })
    // }
  }
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