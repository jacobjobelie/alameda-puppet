import puppeteer from 'puppeteer-extra'
import path from 'path'
import wretch from 'wretch'
import fetch from 'node-fetch'
import _ from 'lodash'
import dotenv from 'dotenv'
import FuzzySearch from 'fuzzy-search' // Or: var FuzzySearch = require('fuzzy-search');
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Slack from 'slack'
dotenv.config()
const bot = new Slack({
  token: process.env.SLACK_BOT_TOKEN,
})
const HEADLESS = true
const NO_LOTS = true

const dataUrls = [
  'https://storage.googleapis.com/samrad-samelie/alameda/1150.json',
  'https://storage.googleapis.com/samrad-samelie/alameda/2100.json',
  'https://storage.googleapis.com/samrad-samelie/alameda/2200.json',
]
const mapUrls = [
  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.23212474567848%2C%22east%22%3A-122.14904063923316%2C%22south%22%3A37.73896450977441%2C%22north%22%3A37.79656841857922%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.23153520538497%2C%22east%22%3A-122.14845109893966%2C%22south%22%3A37.779194856174875%2C%22north%22%3A37.83676742574971%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.26603914215255%2C%22east%22%3A-122.18295503570724%2C%22south%22%3A37.75062926921036%2C%22north%22%3A37.80822409414777%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.25359369232345%2C%22east%22%3A-122.17050958587814%2C%22south%22%3A37.78957344038368%2C%22north%22%3A37.847137920494525%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.30346132232833%2C%22east%22%3A-122.22037721588302%2C%22south%22%3A37.77390325236282%2C%22north%22%3A37.83147994568904%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.3116152377336%2C%22east%22%3A-122.22853113128829%2C%22south%22%3A37.798322878890126%2C%22north%22%3A37.85588053788956%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.27093149139571%2C%22east%22%3A-122.1878473849504%2C%22south%22%3A37.80964813235448%2C%22north%22%3A37.867196960132%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.27848459198165%2C%22east%22%3A-122.19540048553634%2C%22south%22%3A37.830463079155294%2C%22north%22%3A37.88799566996781%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.3211424441545%2C%22east%22%3A-122.23805833770919%2C%22south%22%3A37.82510735081399%2C%22north%22%3A37.88264412015553%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.31813984408312%2C%22east%22%3A-122.23505573763781%2C%22south%22%3A37.851001065316886%2C%22north%22%3A37.90851762777757%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.3255212832921%2C%22east%22%3A-122.24243717684679%2C%22south%22%3A37.874785443507285%2C%22north%22%3A37.932283434827625%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A14%7D',

  'https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-122.3458224349715%2C%22east%22%3A-122.26273832852618%2C%22south%22%3A37.89622719026485%2C%22north%22%3A37.95370843111834%7D%2C%22mapZoom%22%3A14%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22abo%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%7D',
]

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
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: HEADLESS,
    devtools: false,
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })

  const r = await Promise.all(
    dataUrls.map((u) =>
      wretch(u)
        .get()
        .json()
        .then((r) => r.map((d) => ({ ...d, code: u.substr(-9) }))),
    ),
  )
  const data = _.uniqBy(r.flat(), 'SitusAddress')
  console.log(`${data.length} interests`)

  const searcher = new FuzzySearch(data, ['SitusAddress'], {
    caseSensitive: false,
  })

  const results = []

  await page.setRequestInterception(true)
  page.on('request', (request) => {
    request.continue()
  })

  page.on('requestfinished', async (request) => {
    const response = await request.response()
    if (!response) return

    const responseHeaders = response.headers()
    let responseBody
    if (request.url().includes('GetSearchPageState')) {
      if (request.redirectChain().length === 0) {
        // body can only be access for non-redirect responses
        responseBody = await response.buffer()
      }
      const information = {
        url: request.url(),
        requestHeaders: request.headers(),
        requestPostData: request.postData(),
        responseHeaders: responseHeaders,
        responseSize: responseHeaders['content-length'],
        responseBody,
      }
      // zillow data
      results.push(
        ...JSON.parse(information.responseBody.toString()).cat1.searchResults
          .mapResults,
      )
    }
  })

  async function loadPage(url) {
    await page.goto(url)
    await delay(2500)
  }

  // all urls
  for (const url of mapUrls) {
    await loadPage(url)
  }
  // de-dupe
  const zRes = _.uniqBy(results, 'zpid')

  const matches = []

  for (const o of zRes) {
    const addr = o.detailUrl.split('/')[2]

    const address = addr.split('-').slice(0, 4).join(' ')

    if (address.length) {
      const d = searcher.search(address)
      // console.log(o.statusText)
      if (d.length && (NO_LOTS ? !o.statusText.includes('Lot') : true)) {
        matches.push({
          status2: o.statusType ?? '',
          status: o.statusText,
          img: o.imgSrc,
          price: o.priceLabel,
          url: `https://zillow.com${o.detailUrl}`,
          code: d[0].code,
        })
      }
    }
  }

  const slackChunks = _.chunk(matches, 4)

  let c = 1
  await bot.chat?.postMessage({
    channel: 'C02LZ0D2SMS',
    text: `-----------------------------++++++++++++++++++++++++++++++++++++++++----------------------------------------- ${new Date().toISOString()} -----------------------------------++++++++++++++++++++++++++++++++++++---------------------------------  `,
  })
  for (const s of slackChunks) {
    await bot.chat?.postMessage({
      channel: 'C02LZ0D2SMS',
      text: `-------------------------------------------------------------------------------------------------------------------------------- ${c}/${slackChunks.length} --------------------------------------------------------------------------------------------------------------------------------  `,

      attachments: s.map((d) => ({
        text: `${d.status2} ${d.code} ${d.price} ${d.status} ${d.url}`,
        image_url: d.img,
      })),
    })

    c++
    await delay(300)
  }

  await browser.close()
})()
