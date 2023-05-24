(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const home_page = require('..')

document.body.append(home_page())

},{"..":2}],2:[function(require,module,exports){
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

},{"app_cover":3,"navbar":7}],3:[function(require,module,exports){
module.exports = cover_app

const window_bar = require('window_bar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function cover_app () {

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="cover_wrapper">
            <div class="cover_image"></div>
            <div class="content_wrapper">
                WELCOME TO DAT ECOSYSTEM
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    const cover_window = window_bar({name:'Learn_about_us.pdf'})

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
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

        .cover_wrapper{
            position:relative;
            height:300px;
            width:100%;
            display:flex;
            justify-content: center;
            align-items: center;
            background-image: radial-gradient(#A7A6A4 1px, #FFF 1px);
            background-size: 10px 10px;
            background-color:red;
            border: 1px solid var(--ac-4);
        }

        /* This covers background-image will change to an image */
        .cover_image{
            position: absolute;
            width:100%;
            height:100%;
            background-image: radial-gradient(red 1px, #FFF 1px);
            background-size: 10px 10px;
        }

        /* Cover image alignment */
        .content_wrapper{
            position: relative;
            z-index:1;
            color:red;
            text-align:center;
        }

    `
}
},{"window_bar":8}],4:[function(require,module,exports){

module.exports = icon_button

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





// Props - icon/img src
function icon_button (props) {

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const icon_button = document.createElement('div')
    icon_button.classList.add('icon_btn')
    
    const icon = document.createElement('img')
    icon.src = props.src
    icon_button.append(icon)

    icon_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(icon_button, style)
    shadow.adoptedStyleSheets = [sheet]
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
        .icon_btn{
            display:flex;
            justify-content: center;
            align-items:center;
            height:40px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--ac-4);
            background-color: var(--white);
        }
        .icon_btn img{
            pointer-events:none;
        }
        .icon_btn.active{
            background-color: var(--ac-2)
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],5:[function(require,module,exports){
module.exports = logo_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function logo_button(){

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const logo_button = document.createElement('div')
    logo_button.classList.add('logo_button')


    const logo = document.createElement('img')
    logo.src = 'terminal_icon.png'
    const company_name = document.createElement('span')
    company_name.innerHTML = 'DAT ECOSYSTEM'
    logo_button.append(logo, company_name)


    logo_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(logo_button, style)
    shadow.adoptedStyleSheets = [sheet]
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
        .logo_button{
            width: 100%;
            height:40px;
            box-sizing:border-box;
            padding: 10px;
            display:flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            background-color: var(--ac-4);
            color: var(--white);
            font-size: 0.875em;
            letter-spacing: 0.25rem;
        }
    `
}

function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],6:[function(require,module,exports){
module.exports = text_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function text_button (props) {

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const text_button = document.createElement('div')
    text_button.classList.add('text_button')
    text_button.innerHTML = props.text
    text_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(text_button, style)
    shadow.adoptedStyleSheets = [sheet]
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
        .text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: 1.5714285714285714em;
            padding:10px 5px;
            height:40px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--ac-4);
            background-color: var(--white);
            color:var(--ac-4);
        }
        .text_button.active{
            background-color: var(--ac-1);
            color: var(--ac-4);
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],7:[function(require,module,exports){
module.exports = navbar

const icon_button = require('buttons/icon_button')
const logo_button = require('buttons/logo_button')
const text_button = require('buttons/text_button')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function navbar(){

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    const navbar = document.createElement('div')
    navbar.classList.add('navbar')

    shadow.innerHTML = `
    <div class="navbar_wrapper">
        <div class="navbar">
            <div class="nav_toggle_wrapper"></div>
            <div class="page_btns_wrapper"></div>
            <div class="icon_btn_wrapper"></div>
        </div>
    </div>
    <style>${get_theme()}</style>
  `


    
    // sm nav buttons
    const consortium_btn = icon_button({src:'terminal_icon.png'})
    const logo_btn = logo_button()
    logo_btn.classList.add('logo_btn')
    

    // adding nav toggle button
    const nav_toggle_btn = icon_button({src:`terminal_icon.png`})
    nav_toggle_btn.classList.add('nav_toggle_btn')
    nav_toggle_btn.addEventListener('click', function() {
        shadow.querySelector('.navbar').classList.toggle('active');
    });


    const nav_toggle_wrapper = shadow.querySelector('.nav_toggle_wrapper');
    nav_toggle_wrapper.append(consortium_btn, logo_btn, nav_toggle_btn);





    // Page List Buttons
    const text_btns = [
        { text: 'HOME', element: text_button({ text: 'HOME' }) },
        { text: 'PROJECTS', element: text_button({ text: 'PROJECTS' }) },
        { text: 'GROWTH PROGRAM', element: text_button({ text: 'GROWTH PROGRAM' }) },
        { text: 'TIMELINE', element: text_button({ text: 'TIMELINE' }) }
    ]; 
    for (const button_data of text_btns) {
        const { element } = button_data;
        element.classList.add('text_button');
    }
    const page_btns_wrapper = shadow.querySelector('.page_btns_wrapper');
    page_btns_wrapper.append(...text_btns.map(button_data => button_data.element));





    // Adding social and action buttons
    const icon_btns = [
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) },
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) },
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) },
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) },
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) },
        { src: 'terminal_icon.png', element: icon_button({src:'terminal_icon.png'}) }
    ]; 
    for (const button_data of icon_btns) {
        const { element } = button_data;
        element.classList.add('icon_btn');
    }
    const icon_btn_wrapper = shadow.querySelector('.icon_btn_wrapper');
    icon_btn_wrapper.append(...icon_btns.map(button_data => button_data.element));





    // shadow.append(navbar)
    shadow.adoptedStyleSheets = [sheet]
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
        .navbar_wrapper{
            container-type: inline-size;
        }
        .navbar{
            display: block;
            width:100%;
            height:40px;
            overflow:hidden;
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
        .navbar.active{
            height:max-content;
        }


        /* Starting buttons wrapper */
        .nav_toggle_wrapper{
            display: flex;
            width:100%;
            justify-content:stretch;
        }
        .nav_toggle_wrapper .logo_btn{
            width:100% !important;
            flex-grow:1;
        }
        .page_btns_wrapper{
            width:100%;
            display:flex;
            flex-direction:column;
        }
        .page_btns_wrapper .text_button{
            width:100%;
            flex-grow:1;
        }
        .icon_btn_wrapper{
            display:flex;
            justify-content:flex-start;
            // grid-template-columns: repeat(6, 2fr)
        }










        .page_list{
            display: none;
        }

        @container(min-width: 856px) {

            .navbar{
                display: flex;
            }

            .nav_toggle_wrapper{
                width:max-content;
                display:flex;
            }
            .nav_toggle_wrapper .logo_btn{
                width: max-content !important;
            }
            .page_list{
                display:flex;
            }

            .nav_toggle_wrapper .nav_toggle_btn{
                display: none;
            }
            .page_btns_wrapper{
                flex-direction: row;
            }
            .page_btns_wrapper .text_button{
                width:max-content !important;
                flex-grow: unset;
            }
        }
        
        .socials_list{
            display: flex;
        }
    `
}
},{"buttons/icon_button":4,"buttons/logo_button":5,"buttons/text_button":6}],8:[function(require,module,exports){
module.exports = window_bar

const icon_button = require('buttons/icon_button')
const text_button = require('buttons/text_button')



// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function window_bar (props) {
    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="window_bar active">
            <div class="application_icon_wrapper"></div>
            <div class="application_name"><span>${props.name}</span></div>
            <div class="window_bar_actions">
                <div class="actions_wrapper"></div>
            </div>
        </div>
        <style>${get_theme}</style>
    `

    // adding application icon
    const application_icon = icon_button({src:'application_icon.png'})
    const application_icon_wrapper = shadow.querySelector('.application_icon_wrapper')
    application_icon_wrapper.append(application_icon)

    // adding close window button
    const window_bar_actions = shadow.querySelector('.window_bar_actions')
    const close_window_btn = icon_button({src:'close.png'})
    close_window_btn.addEventListener('click', function() {
        shadow.querySelector('.window_bar').classList.toggle('active');
    });
    

    // adding additional actions wrapper
    const actions_wrapper = shadow.querySelector('.actions_wrapper')
    const view_more_btn = text_button({text:'View more (20)'})
    const tell_me_more_btn = text_button({text:'TELL ME MORE'})
    actions_wrapper.append(tell_me_more_btn, view_more_btn)

    // adding addtional actions wrapper toggle button
    const actions_toggle_btn = icon_button({src:`terminal_icon.png`})
    actions_toggle_btn.classList.add('actions_toggle_btn')
    actions_toggle_btn.addEventListener('click', function() {
        shadow.querySelector('.window_bar_actions').classList.toggle('active');
    });


    window_bar_actions.append(actions_toggle_btn, close_window_btn)


    shadow.adoptedStyleSheets = [sheet]
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

        .window_bar{
            position: relative;
            z-index:2;
            height:40px;
            background-color: var(--ac-4);
            display:none;
            width:100%;
            justify-content: flex-start;
            background-size: 10px 10px;
            background-image:  repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF 2px, #293648 2px, #293648);
            container-type: inline-size;
            border: 1px solid var(--ac-4);
        }
        .window_bar.active{
            display:inline-flex;
        }

        .application_icon_wrapper{ 
            display:none;
        }

        .application_name{
            display:flex;
            align-items:center;
            min-height: 100%;
            width: max-content;
            color:var(--white);
            padding: 0 10px;
            box-sizing:border-box;
            border: 1px solid var(--ac-4);
            background-color:var(--ac-4);
        }

        .window_bar_actions{
            margin-left: auto;
            display:flex;
        }
        .window_bar_actions.active .actions_wrapper{
            display:block;
        }
        .actions_wrapper{
            display:none;
            position: absolute;
            z-index:10;
            width: 100%;
            height:max-content;
            top:40px;
            right:0;
            background-color:var(--white);
            // background-color:red;
            border: 1px solid var(--ac-4);
        }




        @container(min-width: 856px) {
            .application_icon_wrapper{ 
                display:block;
            }

            .actions_toggle_btn{
                display:none;
            }

            .actions_wrapper{
                display: flex;
                position: relative;
                top: unset;
                right: unset;
                height:100%;
                width:max-content;
                border: 0px;
            }
        }


    `
}
},{"buttons/icon_button":4,"buttons/text_button":6}]},{},[1]);
