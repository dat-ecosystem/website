module.exports = home_page

const navbar = require('navbar')
const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')

const components = [
    cover_app(),
    app_timeline_mini(),
    app_projects_mini(),
    app_about_us(),
    app_footer()
];


function home_page (opts, protocol) {

    // console.log(opts.light_theme)
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    sheet.replaceSync(get_theme(opts.light_theme))
    // Listening to toggle event 
    const listen = (props) =>{
        const {active_state} = props
        if ( active_state === 'light_theme' )  {
            // active_state = 'dark_theme'
            sheet.replaceSync( get_theme( opts.dark_theme ) )
            navbar(listen, {active_state: 'dark_theme'})
        } else {
            // active_state = 'light_theme'
            sheet.replaceSync( get_theme( opts.light_theme ) ) 
            navbar(listen, {active_state: 'light_theme'})
        }
    }

    

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})

    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0',
        opacity: `1`,
        backgroundImage: `radial-gradient(#A7A6A4 2px, #EEECE9 2px)`,
        backgroundSize: `16px 16px`
    });

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${get_theme}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    
    
    shadow.append(main, navbar(listen, {active_state: 'light_theme'}))
    shadow.adoptedStyleSheets = [sheet]
    return el

}

function get_theme(props){
    return`
        :host{ 
            --bg_color: ${props.bg_color};
            --ac-1: ${props.ac_1};
            --ac-2: ${props.ac_2};
            --ac-3: ${props.ac_3};
            --primary_color: ${props.primary_color};
            font-family: Silkscreen;
        }
        .main-wrapper{
            padding:60px 10px;
        }

        @media(min-width: 856px){
            .main-wrapper{
                padding:60px 20px;
            }
        }

    `
}