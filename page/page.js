/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
{
  const html = document.documentElement
  html.setAttribute('lang', 'en')

  const meta = document.createElement('meta')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')

  const font_url = 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap'
  const html_string = `<link rel="stylesheet" type="text/css" href="${font_url}" ></link>`
  const [link] = Object.assign(document.createElement('div'), { innerHTML: html_string }).children
  const onfontload = new Promise(ok => link.onload = ok)

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)

  document.head.append(meta, link)
  document.adoptedStyleSheets = [sheet]
  onfontload.then(boot)
}
/******************************************************************************
  INITIALIZE PAGE
******************************************************************************/
function boot () {
  const desktop = require('..')
  const light_theme = require('theme/lite-theme')
  const dark_theme = require('theme/dark-theme')
  
  console.log({light_theme, dark_theme})
  
  const el = desktop()
  const shadow = document.body.attachShadow({ mode: 'closed' })
  shadow.append(el)
}
