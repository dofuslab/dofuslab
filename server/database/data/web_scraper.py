import requests
from bs4 import BeautifulSoup
import json


class ItemScraper:
    def get_items_from_page(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, 'html.parser')
        item_urls = []

        item_table = soup.find('table', {'class': 'ak-table'}).tbody.find_all(
            'tr'
        )

        for item in item_table:
            item = 'https://www.dofus.com' + item.find('a')['href']
            item_urls.append(item)

        return item_urls

    def get_item_stats(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, 'html.parser')

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
        set = None
        try:
            set = (
                soup.find(
                    'div', attrs={'class': 'ak-container ak-panel-stack ak-glue'}
                )
                .find_all('div', attrs={'class': 'ak-panel-title'})[3]
                .find('a')
            )
        except IndexError:
            # no set found for this item
            pass
        except:
            print("Error ocurred finding set data")

        if set:
            set = set.text

        # Retrieve item stats
        raw_stats = soup.find(
            'div', {'class': 'ak-container ak-content-list ak-displaymode-col'}
        )
        stats = []
        custom_stats = []

        for stat in raw_stats:
            description = stat.find_next(
                'div', {'class': 'ak-title'}
            ).text.strip()

            # The dofus site does not distinguish special descriptive or custom
            # stats from normal combat stats. As such, discerning them from
            # normal stats is a bit difficult. For now, I'm simply using a
            # char count analysis to separate the 2. This will need testing
            # or refactoring at a later time
            if len(description) > 40:
                custom_stats.append(description)
                continue

            type = None
            min_stat = None
            max_stat = None

            # check and adjust for the description typo that substitutes "HP" for "Initiative"
            description = description.replace("HP", "Initiative")

            # check and adjust for values that have ranges and negative values
            if "to" in description and "-" not in description:
                arr = description.split(' ')
                min_stat = int(arr[0].replace('%', ''))
                max_stat = int(arr[2].replace('%', ''))
                del arr[0]
                del arr[0]
                del arr[0]
                type = ' '.join(arr)
            elif "to" in description and "-" in description:
                arr = description.split(" ")
                min_stat = int(arr[2].replace('%', ''))
                max_stat = int(arr[0].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = ' '.join(arr)
            else:
                arr = description.split(' ')
                max_stat = int(arr[0].replace('%', ''))
                del arr[0]
                type = ' '.join(arr)

            if '%' in description and "Critical" not in description:
                type = '% ' + type

            stats.append(
                {'stat': type, 'minStat': min_stat, 'maxStat': max_stat}
            )

        # Retrive item conditions
        raw_conditions = soup.find(
            'div', attrs={'class': 'ak-container ak-panel no-padding'}
        )
        conditions = []

        if raw_conditions:
            raw_conditions = (
                raw_conditions.text.strip()
                .strip("Conditions")
                .strip()
                .split(" ")
            )
            stat_type = raw_conditions[0]
            condition_type = raw_conditions[1]
            limit = int(raw_conditions[2])

            conditions.append({
                "statType": stat_type,
                "condition": condition_type,
                "limit": limit,
            })

        item = {
            'name': name,
            'itemType': item_type,
            'set': set,
            'level': level,
            'stats': stats,
            'customStats': custom_stats,
            'conditions': conditions,
            'imageUrl': image
        }

        return item

    def write_to_file(item_data):
        with open('items.json', 'w') as outfile:
            json.dump(item_data, outfile)


class SetScraper:
    def get_sets_from_page(url):
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

    def get_set_info(url):
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
                type = None
                value = None

                # check and adjust for the description typo that substitutes "HP" for "Initiative"
                description = description.replace("HP", "Initiative")

                # check and adjust for values that have ranges and negative values
                if "to" in description and "-" not in description:
                    arr = description.split(' ')
                    max_stat = arr[2].replace('%', '')
                    del arr[0]
                    del arr[0]
                    del arr[0]
                    type = ' '.join(arr)
                elif "to" in description and "-" in description:
                    arr = description.split(" ")
                    max_stat = arr[0].replace("%", "")
                    del arr[0]
                    del arr[0]
                    del arr[0]
                    type = ' '.join(arr)
                else:
                    arr = description.split(' ')
                    max_stat = arr[0].replace('%', '')
                    del arr[0]
                    type = ' '.join(arr)

                if '%' in description and "Critical" not in description:
                    type = '% ' + type

                stats.append({'stat': type, 'value': max_stat})

            item_count = 2 + i
            bonus = {item_count: stats}
            all_bonuses.append(bonus)

        set = {'name': name, 'items': item_names, 'bonuses': all_bonuses}

        return set

    def write_to_file(set_data):
        print("writing set data to file")
        with open('sets.json', 'w') as outfile:
            json.dump(set_data, outfile)


class ClassScraper:
    def get_classes_from_page():
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

    def get_class_info(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, 'html.parser')

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
    item_data = []

    # get all item urls
    for i in range(1, 2):
        url = (
            'https://www.dofus.com/en/mmorpg/encyclopedia/equipment?size=24&page='
            + str(i)
        )
        items = items + ItemScraper.getItemsFromPage(url)

    # get item data from each url
    for url in items:
        item = ItemScraper.get_item_stats(url)
        item_data.append(item)

    write_to_file(item_data)


# ClassScraper.getClassUrls('https://www.dofus.com/en/mmorpg/encyclopedia/classes/6-ecaflip')


items = []
a = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14085-sinistrofu-cloak'
b = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14086-sinistrofu-amulet'
c = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/14087-sinistrofu-boots'
items.append(ItemScraper.get_item_stats(a))
items.append(ItemScraper.get_item_stats(b))
items.append(ItemScraper.get_item_stats(c))
ItemScraper.write_to_file(items)

# items = []
# item_test = 'https://www.dofus.com/en/mmorpg/encyclopedia/equipment/15699-belteen'
# items.append(ItemScraper.get_item_stats(item_test))
# ItemScraper.write_to_file(items)

# sets = []
# url = 'https://www.dofus.com/en/mmorpg/encyclopedia/sets/275-sinistrofu-set'
# sets.append(SetScraper.get_set_info(url))
# SetScraper.write_to_file(sets)
