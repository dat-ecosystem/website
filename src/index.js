module.exports = home_page
const navbar = require('navbar')

function home_page () {

    const el = document.createElement('div');
    const shadow = el.attachShadow({mode: 'closed'})


    const navbar_component = navbar()

    const main = document.createElement('div')


    // Setting padding and margin to 0px
    document.documentElement.style.margin = `0`
    document.documentElement.style.padding = `0`
    document.body.style.margin = `0`
    document.body.style.padding = `0`

    main.append(navbar_component)
    shadow.append(main)
    return el

}
