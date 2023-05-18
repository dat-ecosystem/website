const navbar = require('../src/node_module/navbar/index.js')

const title = document.createElement('h1')
title.innerHTML = 'Icon button'
const navbar_component = navbar()

const main = document.createElement('div')


// Setting padding and margin to 0px
document.documentElement.style.margin = `0`
document.documentElement.style.padding = `0`
document.body.style.margin = `0`
document.body.style.padding = `0`

main.append(navbar_component)
document.body.append(main)
