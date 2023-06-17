const home_page = require('..')
const navbar = require('../src/node_modules/navbar/index')
const light_theme = require('../src/node_modules/theme/light_theme/index')
const dark_theme = require('../src/node_modules/theme/dark_theme/index')
const my_theme = require('../src/node_modules/my_theme/index')


// Default Theme
let current_theme = light_theme
const sheet = new CSSStyleSheet()

document.body.append( navbar({data: current_theme}, page_protocol))
document.body.append(home_page(my_theme))

// Adding font link
document.head.innerHTML = ` 
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" ></link> 
    <style>${get_theme(current_theme)}</style>
`
document.adoptedStyleSheets = [sheet]



function page_protocol (handshake, send, mid = 0) {
    if (send) return listen
    
    send = handshake(null, listen)
    function listen (message) {
        const PROTOCOL = {
            'change_theme': change_theme
        }
        const {type} = message
        // const { head, type, data } = message
        // const [by, to, id] = head
        // if (to !== id) return console.error('address unknown', message)
        const action = PROTOCOL[type] || invalid
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function change_theme () {
        // const [to] = head
        ;current_theme = current_theme === light_theme ? dark_theme : light_theme
        sheet.replaceSync( get_theme(current_theme) )
        return send({
            // head: [id, to, mid++],
            // refs: { cause: head },
            // type: 'theme',
            from: 'page updated',
            data: current_theme
        })
    }
}

function get_theme(opts) {
    return`
        :root{ 
            --bg_color: ${opts.bg_color};
            --ac-1: ${opts.ac_1};
            --ac-2: ${opts.ac_2};
            --ac-3: ${opts.ac_3};
            --primary_color: ${opts.primary_color};
            font-family: Silkscreen;
        }
        html, body{
            padding:0px;
            margin: 0px;
        }
    `
}