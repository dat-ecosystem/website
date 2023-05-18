module.exports = navbar

// const icon_button = require('..')
const buttons = require('../buttons/index.js')

function navbar(){
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const navbar = document.createElement('div')
    navbar.classList.add('navbar')

    // Adding page list buttons
    const consortium_btn = buttons.icon_button({src:'terminal_icon.png'})
    const home_btn = buttons.text_button({text:'HOME'})
    const project_btn = buttons.text_button({text:'PROJECTS'})
    const growth_program_btn = buttons.text_button({text:'GROWTH PROGRAM'})
    const timeline = buttons.text_button({text:'TIMELINE'})
    const logo_btn = buttons.logo_button()
    const page_btn_list = document.createElement('div')
    page_btn_list.classList.add('page_list')
    page_btn_list.append(consortium_btn, logo_btn, home_btn, project_btn, growth_program_btn, timeline)


    // Adding social and action buttons
    const theme_btn = buttons.icon_button({src:'terminal_icon.png'})
    const terminal_btn = buttons.icon_button({src:'terminal_icon.png'})
    const discord_btn = buttons.icon_button({src:'terminal_icon.png'})
    const twitter_btn = buttons.icon_button({src:'terminal_icon.png'})
    const github_btn = buttons.icon_button({src:'terminal_icon.png'})
    const blogger_btn = buttons.icon_button({src:'terminal_icon.png'})
    const social_list = document.createElement('div')
    social_list.classList.add('socials_list')
    social_list.append(theme_btn, terminal_btn, discord_btn, twitter_btn, github_btn, blogger_btn)

    // Appending to navbar
    navbar.append(page_btn_list, social_list)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(navbar, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function get_theme(){
        return`
            :host{ 
                --white: white;
                --ac-1: #2ACA4B;
                --ac-2: #F9A5E4;
                --ac-3: #88559D;
                --ac-4: #293648;
            }
            .navbar{
                display: flex;
                justify-content: space-between;
                width:100%;
                border-bottom: 1px solid var(--ac-4);

                // background-color: #EEECE9;
                // opacity: 0.8;
                // background: repeating-linear-gradient( -45deg, #777674, #777674 9px, #EEECE9 9px, #EEECE9 45px );

                --s: 20px; /* control the size */
                --_g: #EEECE9 /* first color */ 0 25%, #0000 0 50%;
                background:
                    repeating-conic-gradient(at 33% 33%,var(--_g)),
                    repeating-conic-gradient(at 66% 66%,var(--_g)),
                    #777674;  /* second color */ 
                background-size: var(--s) var(--s); 
                  
            }
            .page_list{
                display: flex;
            }
            .socials_list{
                display: flex;
            }
        `
    }
}