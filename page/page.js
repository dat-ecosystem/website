config().then(boot)
/******************************************************************************
  CSS & HTML Defaults
******************************************************************************/
async function config () {
  // @TODO: there are font files in `src/node_modules/theme/assets/fonts/...`
  // => those could be used instead
  const searchparams = `family=Silkscreen:wght@400;700&display=swap`
  const google_font_url = `https://fonts.googleapis.com/css2?${searchparams}`
  const html = document.documentElement
  const meta = document.createElement('meta')
  const link = document.createElement('link')
  const sheet = new CSSStyleSheet()
  html.setAttribute('lang', 'en')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', google_font_url)
  sheet.replaceSync(`html, body { padding:0px; margin: 0px; }`)
  document.adoptedStyleSheets = [sheet]
  document.head.append(meta, link)
  await document.fonts.ready
}
/******************************************************************************
  INITIALIZE PAGE
******************************************************************************/
async function boot () {
  const desktop = require('..')
  const light_theme = require('theme/lite-theme')
  const dark_theme = require('theme/dark-theme')

  const shadow = document.body.attachShadow({ mode: 'closed' })
  
  console.log({light_theme, dark_theme})

  const el = await desktop()

  shadow.append(el)
}