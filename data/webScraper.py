import requests
from bs4 import BeautifulSoup
import json

def getItemStats(url):
    urlResponse = requests.get(url)
    soup = BeautifulSoup(urlResponse.text, 'html.parser')

    # get and clean data
    name = soup.find('h1', attrs = {'class': 'ak-return-link'}).text.strip()
    lvl = soup.find('div', attrs = {'class': 'ak-encyclo-detail-level col-xs-6 text-right'}).text[7:0]
    image = soup.find('img', attrs = {'class': 'img-maxresponsive'})["src"]

    rawStats = soup.find('div', {'class': 'ak-container ak-content-list ak-displaymode-col'})
    stats = {}

    for stat in rawStats:
        description = stat.find_next('div', {'class': 'ak-title'}).text.strip()
        type = ""
        maxStat = ""

        if "to" in description and "-" not in description:
            arr = description.split(' ')
            maxStat = arr[2].replace('%', '')
            del arr[0]
            del arr[0]
            del arr[0]
            type = ' '.join(arr)
        elif "to" in description and "-" in description:
            arr = description.split(" ")
            maxStat = arr[0].replace("%", "")
            del arr[0]
            del arr[0]
            del arr[0]
            type = ' '.join(arr)
        else:
            arr = description.split(' ')
            maxStat = arr[0].replace('%', '')
            del arr[0]
            type = ' '.join(arr)

        if '%' in description and "Critical" not in description:
            type = '% ' + type

        stats[type] = {'description': description, 'maxStat': maxStat}

    item = {'name': name, 'lvl': lvl, 'image': image, 'stats': stats}

    return item

def getItemsFromPage(url):
    urlResponse = requests.get(url)
    soup = BeautifulSoup(urlResponse.text, 'html.parser')
    itemURLs = []

    itemTable = soup.find('table', {'class': 'ak-table'}).tbody.find_all('tr')

    for item in itemTable:
        item = 'https://www.dofus.com' + item.find('a')['href']
        itemURLs.append(item)

    return itemURLs

def writeToFile(itemData):
    with open('data.txt', 'w') as outfile:
        json.dump(itemData, outfile)

def __main__(lastPage):
    items = []
    itemData = []

    # get all item urls
    for i in range(1, lastPage + 1):
        url = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment?size=24&page=' + str(i)
        items = items + getItemsFromPage(url)

    # get item data from each url
    for url in items:
        item = getItemStats(url)
        itemData.append(item)

    writeToFile(itemData)

lastPage = 1
# __main__(lastPage)

testurl = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14076-count-harebourg"
testdata = getItemStats(testurl)
writeToFile(testdata)
