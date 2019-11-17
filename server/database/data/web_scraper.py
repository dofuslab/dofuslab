import requests
from bs4 import BeautifulSoup
import json


class ItemScraper:
    def getItemsFromPage(url):
        urlResponse = requests.get(url)
        soup = BeautifulSoup(urlResponse.text, 'html.parser')
        itemURLs = []

        itemTable = soup.find('table', {'class': 'ak-table'}).tbody.find_all(
            'tr'
        )

        for item in itemTable:
            item = 'https://www.dofus.com' + item.find('a')['href']
            itemURLs.append(item)

        return itemURLs

    def getItemStats(url):
        urlResponse = requests.get(url)
        soup = BeautifulSoup(urlResponse.text, 'html.parser')

        # get and clean data
        name = soup.find('h1', attrs={'class': 'ak-return-link'}).text.strip()
        item_type = soup.find(
            'div', attrs={'class': 'ak-encyclo-detail-type col-xs-6'}
        ).text[7:]
        level = soup.find(
            'div',
            attrs={'class': 'ak-encyclo-detail-level col-xs-6 text-right'},
        ).text[7:]
        image = soup.find('img', attrs={'class': 'img-maxresponsive'})["src"]
        set = (
            soup.find(
                'div', attrs={'class': 'ak-container ak-panel-stack ak-glue'}
            )
            .find_all('div', attrs={'class': 'ak-panel-title'})[3]
            .find('a')
        )

        if set:
            set = set.text

        # Retrieve item stats
        rawStats = soup.find(
            'div', {'class': 'ak-container ak-content-list ak-displaymode-col'}
        )
        stats = []

        for stat in rawStats:
            description = stat.find_next(
                'div', {'class': 'ak-title'}
            ).text.strip()
            type = ""
            maxStat = ""

            # check and adjust for the description typo that substitutes "HP" for "Initiative"
            description = description.replace("HP", "Initiative")

            # check and adjust for values that have ranges and negative values
            if "to" in description and "-" not in description:
                arr = description.split(' ')
                maxStat = int(arr[2].replace('%', ''))
                del arr[0]
                del arr[0]
                del arr[0]
                type = ' '.join(arr)
            elif "to" in description and "-" in description:
                arr = description.split(" ")
                maxStat = int(arr[0].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = ' '.join(arr)
            else:
                arr = description.split(' ')
                maxStat = int(arr[0].replace('%', ''))
                del arr[0]
                type = ' '.join(arr)

            if '%' in description and "Critical" not in description:
                type = '% ' + type

            stats.append(
                {'stat': type, 'description': description, 'maxStat': maxStat}
            )

        # Retrive item conditions
        rawConditions = soup.find(
            'div', attrs={'class': 'ak-container ak-panel no-padding'}
        )
        conditions = {}

        if rawConditions:
            rawConditions = (
                rawConditions.text.strip()
                .strip("Conditions")
                .strip()
                .split(" ")
            )
            conditionType = rawConditions[0]
            conditionLimitType = rawConditions[1]
            conditionLimit = rawConditions[2]

            conditions = {
                "conditionType": conditionType,
                "conditionLimitType": conditionLimitType,
                "conditionLimit": conditionLimit,
            }

        item = {
            'name': name,
            'item_type': item_type,
            'set': set,
            'level': level,
            'stats': stats,
            'conditions': conditions,
            'image_url': image,
        }

        return item

    def writeToFile(item_data):
        with open('items.json', 'w') as outfile:
            json.dump(item_data, outfile)


class SetScraper:
    def getSetsFromPage(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, 'html.parser')

        set_urls = []

        set_table = soup.find('table', {'class': 'ak-table'}).tbody.find_all(
            'tr'
        )
        for set in set_table:
            set = 'https://www.dofus.com' + set.find('a')['href']
            set_urls.append(set)

        return set_urls

    def getSetInfo(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, 'html.parser')

        name = soup.find('h1', attrs={'class': 'ak-return-link'}).text.strip()

        # extracting items may be extraneous. Review this segment
        item_names = []
        items = soup.find(
            'div', attrs={'class': 'ak-item-list-preview'}
        ).find_all('a')
        for item in items:
            item_name = item['href'].split('-')
            del item_name[0]
            for i in range(len(item_name)):
                item_name[i] = item_name[i].capitalize()
            item_name = ' '.join(item_name)
            item_names.append(item_name)

        all_bonuses = []
        raw_bonuses = soup.find_all('div', attrs={'class': 'set-bonus-list'})
        for i in range(len(raw_bonuses)):
            stats = []
            bonuses = raw_bonuses[i].find_all(
                'div', attrs={'class': 'ak-title'}
            )
            for bonus in bonuses:
                description = bonus.text.strip()
                type = ""
                max_stat = 0

                # check and adjust for the description typo that substitutes "HP" for "Initiative"
                description = description.replace("HP", "Initiative")

                # check and adjust for values that have ranges and negative values
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

                stats.append(
                    {
                        'stat': type,
                        'description': description,
                        'maxStat': maxStat,
                    }
                )

            item_count = 2 + i
            bonus = {'item_count': item_count, 'stats': stats}
            all_bonuses.append(bonus)

        set = {'name': name, 'items': item_names, 'bonuses': all_bonuses}

        return set

    def writeToFile(set_data):
        with open('sets.json', 'w') as outfile:
            json.dump(set_data, outfile)


class ClassScraper:
    def getClassesFromPage():
        url_response = requests.get(
            'https://www.dofus.com/en/mmorpg/encyclopedia/classes'
        )
        soup = BeautifulSoup(url_response.text, 'html.parser')

        class_urls = []

        class_table = (
            soup.find('div', attrs={'class': 'ak-content-sections'})
            .find('div', attrs={'class': 'row'})
            .find_all('div', attrs={'class': 'col-sm-6'})
        )

        for some_class in class_table:
            class_urls.append(
                'https://www.dofus.com'
                + some_class.find('div', attrs={'class': 'ak-breed-section'}).a[
                    'href'
                ]
            )

        return class_urls

    def getClassInfo(url):
        urlResponse = requests.get(url)
        soup = BeautifulSoup(urlResponse.text, 'html.parser')

        name = ''.join(url.split('-')[-1:]).capitalize()
        spells = []

        # get spell urls from class page
        spell_urls = []
        raw_spells = soup.find(
            'div', attrs={'class': 'ak-spell-list-row'}
        ).find_all('div', attrs={'class': 'ak-spell-group'})

        for spell in raw_spells:
            variant_urls = []
            raw_variants = spell.find_all(
                'div', attrs={'class': 'ak-list-block'}
            )

            for variant in raw_variants:
                variant_urls.append(variant.a['href'])

            spell_urls.append(variant_urls)

        # get spell data

        return {'name': name, 'spells': spells}


def __main__():
    items = []
    itemData = []

    # get all item urls
    for i in range(1, 2):
        url = (
            'https://www.dofus.com/en/mmorpg/encyclopedia/equipment?size=24&page='
            + str(i)
        )
        items = items + ItemScraper.getItemsFromPage(url)

    # get item data from each url
    for url in items:
        item = ItemScraper.getItemStats(url)
        itemData.append(item)

    writeToFile(itemData)


# ClassScraper.getClassUrls('https://www.dofus.com/en/mmorpg/encyclopedia/classes/6-ecaflip')


items = []
a = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14085-sinistrofu-cloak'
b = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14086-sinistrofu-amulet'
c = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14087-sinistrofu-boots'
items.append(ItemScraper.getItemStats(a))
items.append(ItemScraper.getItemStats(b))
items.append(ItemScraper.getItemStats(c))
ItemScraper.writeToFile(items)

# items = []
# item_test = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/15699-belteen'
# items.append(ItemScraper.getItemStats(item_test))
# ItemScraper.writeToFile(items)

# sets = []
# url = 'https://www.dofus.com/en/mmorpg/encyclopedia/sets/275-sinistrofu-set'
# sets.append(SetScraper.getSetInfo(url))
# SetScraper.writeToFile(sets)
