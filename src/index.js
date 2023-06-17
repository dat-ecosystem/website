module.exports = home_page

const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_projects = require('app_projects')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')
const project_filter = require('project_filter')


// HOME PAGE

function home_page (opts, protocol) {

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()

    const components = [
        // app_projects(),
        // project_filter(),
        cover_app(),
        app_timeline_mini(),
        app_projects_mini(),
        app_about_us(),
        app_footer(),
    ]

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${get_theme()}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    shadow.append(main)
    shadow.adoptedStyleSheets = [sheet]
    return el


    // Placeholder code for learning purposes
    // Will be removed
    function home_protocol (handshake, send){
        listen.id  = id
        if (send) return listen
        const PROTOCOL = {
            'toggle_display' : toggle_display
        }
        send = handshake(null, listen)
        function listen (message){
            function format (new_message = {
                head: [from = 'alice', to = 'bob', message_id = 1],
                refs: { cause: message.head }, // reply to received message
                type: 'change_theme',
                data: `.foo { background-color: red; }`
            }) { return new_message }
            console.log(format())
            // const { head, type, data } = message
            // const [by, to, id] = head
            // if (to !== id) return console.error('address unknown', message)
            // const action = PROTOCOL[type] || invalid
            // action(message)
        }
        function invalid (message) { console.error('invalid type', message) }
        async function toggle_display ({ head: [to], data: theme }) {
            // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
        }
    }
}



function get_theme() {
    return`
        .main-wrapper{
            margin: 0;
            padding:30px 10px;
            opacity: 1;
            background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
            background-size: 16px 16px;
        }
        @media(min-width: 856px){
            .main-wrapper{
                padding-inline:20px;
            }
        }
    `
}