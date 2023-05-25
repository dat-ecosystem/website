module.exports = home_page
const navbar = require('navbar')
const cover_app = require('app_cover')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function home_page () {

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})


    const navbar_component = navbar()
    const cover_application = cover_app()

    // adding a `main-wrapper` 
    const main = document.createElement('div')
    main.classList.add('main-wrapper')
    const style = document.createElement('style')
    style.textContent = get_theme()
    
    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0',
        opacity: `1`,
        backgroundImage: `radial-gradient(#A7A6A4 2px, #EEECE9 2px)`,
        backgroundSize: `16px 16px`
    });

    // Adding font link
    var link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('type', 'text/css')
    link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap')
    document.head.appendChild(link)
    
    main.append(cover_application,  style)
    main.adoptedStyleSheets = [sheet]
    shadow.append(navbar_component, main)
    return el

}


function get_theme(){
    return`
        :host{ 
            --white: white;
            --ac-1: #2ACA4B;
            --ac-2: #F9A5E4;
            --ac-3: #88559D;
            --ac-4: #293648;
            font-family: Silkscreen;
        }
        .main-wrapper{
            padding:10px;
            
        }

        @media(min-width: 856px){
            .main-wrapper{
                padding:20px;
            }
        }

    `
}
