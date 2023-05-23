module.exports = home_page
const navbar = require('navbar')
const window_bar = require('window_bar')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function home_page () {

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})


    const navbar_component = navbar()
    const cover_window = window_bar({name:'Learn_about_us.pdf'})

    // adding a `main-wrapper` 
    const main = document.createElement('div')
    main.classList.add('main-wrapper')
    const style = document.createElement('style')
    style.textContent = get_theme()
    
    const body_style = document.body.style;
    Object.assign(body_style, {
        margin: '0',
        padding: '0'
    });

    
    main.append(cover_window, style)
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
