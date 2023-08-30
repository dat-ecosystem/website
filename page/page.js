const desktop = require('..')
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

  document.head.append(meta, link)

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)
  // document.adoptedStyleSheets = [sheet]
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
}


const light_theme = require('theme/lite-theme')
const dark_theme = require('theme/dark-theme')

console.log({light_theme, dark_theme})
const el = desktop()

document.body.append(el)
