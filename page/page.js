const home_page = require('..')
const my_theme = require('../src/node_modules/my_theme')
const navbar = require('../src/node_modules/navbar')

// Passing theme
document.body.append(home_page(my_theme))

// Adding font link
document.head.innerHTML = ` <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" ></link> `


function page_protocol (handshake, send, mid = 0) {
    listen.id = `${__dirname}`
    if (send) return listen
    const PROTOCOL = {
        'theme': change_theme
    }
    send = handshake(null, listen)
    function listen (message) {
        const { head, type, data } = message
        const [by, to, id] = head
        if (to !== id) return console.error('address unknown', message)
        const action = PROTOCOL[type] || invalid
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function change_theme ({ head, data: theme_name }) {
        const [to] = head
        switch (theme_name) {
        case 'light': return send({
            head: [id, to, mid++], refs: { cause: head }, type: 'theme', data: light_theme
        })
        case 'dark': return send({
            head: [id, to, mid++], refs: { cause: head }, type: 'theme', data: dark_theme
        })
        }
    }
}
