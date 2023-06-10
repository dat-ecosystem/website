module.exports = home_page

const navbar = require('navbar')
const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_projects = require('app_projects')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')
const project_filter = require('project_filter')

const components = [
    app_projects(),
    project_filter(),
    cover_app(),
    app_timeline_mini(),
    app_projects_mini(),
    app_about_us(),
    app_footer(),
];


// HOME PAGE

function home_page (opts, protocol) {

    // console.log(opts.light_theme)
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    sheet.replaceSync(home_theme(opts.light_theme))
    
    const state = {}    

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})

    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0',
        opacity: `1`,
        backgroundImage: `radial-gradient(${opts.light_theme.primary_color} 2px, ${opts.light_theme.bg_color} 2px)`,
        backgroundSize: `16px 16px`
    });

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${home_theme}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    
    
    shadow.append(main, navbar(opts, protocol))
    shadow.adoptedStyleSheets = [sheet]
    return el





    function protocol(message, notify){
        const { from } = message
        state[from] = { active_state: 'light_theme', notify}
        return listen
    }
    function listen ( message ){
        const {from, active_state} = message
        if ( active_state === 'light_theme' )  {
            let notify = state['navbar-0'].notify
            sheet.replaceSync( home_theme( opts.dark_theme ) )
            Object.assign(body_style, { backgroundImage: `radial-gradient(${opts.dark_theme.primary_color} 2px, ${opts.dark_theme.bg_color} 2px)`, });
            notify( active_state )
        } else {
            let notify = state['navbar-0'].notify
            Object.assign(body_style, { backgroundImage: `radial-gradient(${opts.light_theme.primary_color} 2px, ${opts.light_theme.bg_color} 2px)`, });
            sheet.replaceSync( home_theme( opts.light_theme ) ) 
            notify( active_state )
        }
    }

}
function home_theme(props){
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





// PROJECT PAGE
// function project_page(opts, protocol){

// }