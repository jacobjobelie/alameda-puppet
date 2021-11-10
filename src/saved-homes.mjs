import puppeteer from 'puppeteer-extra'
import wretch from 'wretch'
import fetch from 'node-fetch'
import _ from 'lodash'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const ZILLOW_EMAIL = ''
const ZILLOW_PASS = ''
const dataUrls = [
  'https://storage.googleapis.com/samrad-samelie/alameda/1150.json',
  'https://storage.googleapis.com/samrad-samelie/alameda/2100.json',
]
// if it crashes or you stop, pick up where you left off
const START_INDEX = 181
const HEADLESS = true
const DEBUG = true

wretch().polyfills({
  fetch,
})
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}
puppeteer.use(StealthPlugin())
;(async () => {
  const browser = await puppeteer.launch({ headless: HEADLESS, devtools: true })
  const page = await browser.newPage()

  const r = await Promise.all(dataUrls.map((u) => wretch(u).get().json()))
  const data = _.uniqBy(r.flat(), 'SitusAddress')

  let counter = START_INDEX
  await page.goto('https://zillow.com')

  // Type into search box.
  await page.waitForSelector('a[data-za-action="Sign in"]')
  await page.click('a[data-za-action="Sign in"]')
  await page.waitForSelector('#reg-login-email')
  await page.type('#reg-login-email', ZILLOW_EMAIL, { delay: 20 })
  await page.type('#inputs-password', ZILLOW_PASS, { delay: 20 })
  await page.click('input[value="Sign in"]')

  await page.waitForSelector('#search-box-input')

  // mfg.click()
  async function doSearch(d) {
    let failed = false
    let linkHandlers
    console.log('\n')
    try {
      await page.type('#search-box-input', d.SitusAddress, { delay: 10 })
      console.log(`trying ${d.SitusAddress}`)
      await delay(1400)
      await (await page.$('#search-box-input')).focus()
      await (await page.$('#search-box-input')).press('Enter')
      await page.waitForSelector('.media-column-container')
      await delay(500)
      linkHandlers = await page.$x("//span[contains(text(), 'Save')]")
    } catch (e) {
      console.log('uh oh')
      failed = true
    }

    if (!failed && linkHandlers) {
      if (linkHandlers.length) {
        await delay(2000)

        let btn = await linkHandlers[0].$x('../..')
        const [elementHandle] = await linkHandlers[0].$x('../../@aria-pressed')
        const propertyHandle = await elementHandle.getProperty('value')
        const isSaved = await propertyHandle.jsonValue()
        if (isSaved == 'false') {
          try {
            await btn[0].click()
          } catch (e) {
            console.log(`fail to save`)
          }
          console.log(`Saved ${d.SitusAddress}`)
        } else {
          console.log(`Alreday saved ${d.SitusAddress}, ignoring`)
        }
        await delay(1000)
        // console.log(btn)
        // dialog kill
        const isH = await page.$x(
          "//h6[contains(text(), 'Is this your home?')]",
        )
        if (isH.length) {
          btn = await isH[0].$x('../..')
          const no = await btn[0].$x("//button[contains(text(), 'No')]")
          if (no.length) {
            try {
              await no[0].click()
            } catch (e) {
              console.log(` fail to dialog`)
            }
          }
        }
      } else {
        console.log(`failed on ${d.SitusAddress}`)
      }
    }
    // reset
    await page.goto('https://zillow.com')
    await page.waitForSelector('#search-box-input')
    await delay(1100)
  }

  async function next() {}

  for (const u of data.slice(START_INDEX)) {
    console.log(`at index ${counter}`)
    await doSearch(u)
    counter++
  }
  console.log('complete')
  // await doSearch(r[0][counter])

  // // Wait for suggest overlay to appear and click "show all results".
  // const allResultsSelector = '.devsite-suggest-all-results'
  // await page.waitForSelector(allResultsSelector)
  // await page.click(allResultsSelector)

  // // Wait for the results page to load and display the results.
  // const resultsSelector = '.gsc-results .gs-title'
  // await page.waitForSelector(resultsSelector)

  // // Extract the results from the page.
  // const links = await page.evaluate((resultsSelector) => {
  //   const anchors = Array.from(document.querySelectorAll(resultsSelector))
  //   return anchors.map((anchor) => {
  //     const title = anchor.textContent.split('|')[0].trim()
  //     return `${title} - ${anchor.href}`
  //   })
  // }, resultsSelector)
  // console.log(links.join('\n'))

  // await browser.close()
})()
