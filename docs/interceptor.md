### 

## Puppeteer guide.

Using zillow urls for the map, we scrape the data and cross ref with good known properties. Post to slack.

#### Update the code in `interceptor.mjs`

1.  `mapUrls`

- Navigate to zillow.com map view and make urls in a region to scan.

2. Make a `.env` in the project root

```
SLACK_BOT_TOKEN=
```

3. `node --experimental-modules ./src/saved-homes.mjs`

#### Bonus

https://github.com/alseambusher/crontab-ui on Mac

