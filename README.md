# alameda-puppet

### Goal - save a list of properties in the Alameda to Zillow so we can be notified when status changes on [Specific UseCodes](https://www.acgov.org/MS/prop/useCodeList.aspx)



#### Why? 

Because there are some super nice spots to dream about & I want to filter out all the noise. You cannot filter property use codes on any realtor.

I want to be notified when something happens.

MLS data is notoriously hard to scrape. You could scrape google homepage for every single entry but cron jobs, databases, telegram ZzZzz.

Let Zillow do it.

Not every 400k property though...

#### But why not just make nice filters in Zillow?

You get good info on properties there, but also some lies. Usually you want price, sq footage, bed rooms which is great but what you can't filter out are **all the flip jobs and home depot homes**.

### Narrowing down what we want.

Take the csv from https://data.acgov.org/datasets/b55c25ae04fc47fc9c188dbbfcd51192_0/about

Need some way to filter use codes https://github.com/BurntSushi/xsv to the rescue.

> Display in terminal the Historical Properties

```
xsv search -s UseCode '1150' Parcels.csv  \
  | xsv select APN,SitusAddress \
  | xsv table
```

> Save to csv file

```
 xsv search -s UseCode '1150' Parcels.csv  \
  | xsv select APN,SitusAddress > 1150.csv
```

These are the codes I want

 `2100` - Two, three or four single family homes

 `1150` - Historical residential

I end up with `2100.csv` and `1150.csv`

**Convert to json**

- `cargo install csv2json-easy`
- `csv2json-easy -i 1150.csv -o 1150.json`

Will look something like 

```
[{"SitusAddress":"51 8TH ST OAKLAND 94607","APN":"1-169-8"},{...}]
```

**Upload the files somewhere you can access in a browser publicly.**

> 📡 Make sure the files are just named by their use code, eg : `1150.json`

## Puppeteer

- Saved homes (failure) [readme]('./docs/saved-homes.md')
- ✅ Iterceptor [readme]('./docs/saved-homes.md')