module.exports = {
    icon_button: icon_button,
    text_button: text_button,
    logo_button: logo_button
}



// Text Button Component
// Props - icon/img src
function icon_button(props){

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

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

}



// Text Button Component
// Props - name
function text_button(props){

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

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
                width: max-content !important;
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

}


// Logo Button Component
function logo_button(){
    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()
    sheet.replaceSync(theme)

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
                width: max-content;
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
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}