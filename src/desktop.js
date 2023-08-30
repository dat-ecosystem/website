const home_page = require('home_page')
const growth_page = require('growth_page')
const timeline_page = require('timeline_page')
const projects_page = require('projects_page')
const consortium_page = require('consortium_page')
const terminal = require('terminal')
const navbar = require('navbar')

const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')

// Default Theme
let current_theme = light_theme
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme(current_theme))

//Default Page
let current_page = consortium_page({data: current_theme})
let notify
const PROTOCOL = {
  'active_page': 'HOME',
  'handle_page_change': handle_page_change,
  'handle_theme_change': handle_theme_change,
  'toggle_terminal': toggle_terminal
}

const terminal_wrapper = terminal({ data: current_theme })

const page_list = {
  'HOME': home_page({ data: current_theme }),
  'PROJECTS': projects_page({ data: current_theme }),
  'GROWTH PROGRAM': growth_page({ data: current_theme }),
  'TIMELINE': timeline_page({ data: current_theme }),
  'DEFAULT': consortium_page({ data: current_theme })
}

const page_filler = document.createElement('div')
page_filler.classList.add('page_filler')
document.body.append(page_filler, navbar({data: current_theme}, page_protocol), current_page)
handle_page_change('DEFAULT')

// Adding font link
document.adoptedStyleSheets = [sheet]


function handle_page_change (active_page) {
  PROTOCOL.active_page = active_page;
  document.body.removeChild(current_page)
  current_page = page_list[active_page]
  document.body.append(current_page)
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
  ;document.body.contains(terminal_wrapper) ? 
  document.body.removeChild(terminal_wrapper) :
  document.body.append(terminal_wrapper)
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

function get_theme (opts) {
  return`
    :root{ 
      --bg_color: ${opts.bg_color};
      --ac-1: ${opts.ac_1};
      --ac-2: ${opts.ac_2};
      --ac-3: ${opts.ac_3};
      --primary_color: ${opts.primary_color};
      font-family: Silkscreen;
      color: var(--primary_color);
    }
    svg{
      fill: var(--bg_color);
    }
    .page_filler{
      background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
      background-size: 16px 16px;
      width: 100vw;
      height: 100vh;
      z-index: -100;
      position: fixed;
      top: 41px;
    }
  `
}