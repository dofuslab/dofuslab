import csv
import json
import os
import scraper_utils


class ItemScraper:
    def get_all_item_ids():
        # get the last number for the paginated list of items
        url = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment?size=96"
        soup = scraper_utils.get_soup(url)
        page_data = soup.find("ul", {"class": "ak-pagination"}).find_all("li")
        final_page_number = int(page_data[-1].find("a")["href"].split("=")[-1])

        # get all item ids from each page and write to csv
        item_ids = []
        for i in range(1, final_page_number + 1):
            url = (
                "https://www.dofus.com/en/mmorpg/encyclopedia/equipment?size=96&page="
                + str(i)
            )
            soup = scraper_utils.get_soup(url)
            item_table = soup.find("table", {"class": "ak-table"}).tbody.find_all("tr")
            for item in item_table:
                id = item.find("a")["href"].split("/")[-1].split("-")[0]
                item_ids.append(id)
            print("Finished page " + str(i))

        with open("all_item_ids.csv", "w") as file:
            writer = csv.writer(file)
            writer.writerow(item_ids)

    def get_item_data(max_number_of_items):
        # get all item ids from csv
        all_item_ids = []
        with open("all_item_ids.csv") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_item_ids = row

        # for each id in the csv, start scraping for that id's info
        items = []
        i = 0
        for id in all_item_ids:
            # early exit for now as to avoid scraping 2000+ items
            if i == max_number_of_items:
                break
            i = i + 1

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment/" + id
            soup = scraper_utils.get_soup(url)

            names = scraper_utils.get_alternate_names(soup, url)
            item_type = soup.find(
                "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
            ).text[7:]
            level = level = soup.find(
                "div", attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
            ).text[7:]
            image = soup.find("img", attrs={"class": "img-maxresponsive"})["src"]
            set = None
            try:
                set = (
                    soup.find(
                        "div", attrs={"class": "ak-container ak-panel-stack ak-glue"}
                    )
                    .find_all("div", attrs={"class": "ak-panel-title"})[3]
                    .find("a")
                )
                set = set["href"].split("/")[-1].split("-")[0]
            except:
                # print("No set found for this item")
                pass

            all_stats = scraper_utils.get_stats(soup)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(soup)

            item = {
                "dofusID": id,
                "name": names,
                "itemType": item_type,
                "setID": set,
                "level": level,
                "stats": stats,
                "customStats": custom_stats,
                "conditions": conditions,
                "imageUrl": image,
            }

            items.append(item)
            print("Item " + str(i) + " complete")

        with open("items.json", "w") as file:
            print("Writing item data to file")
            json.dump(items, file)


class SetScraper:
    def get_all_set_ids():
        # get the last number for the paginated list of items
        url = "https://www.dofus.com/en/mmorpg/encyclopedia/sets?size=96"
        soup = scraper_utils.get_soup(url)
        page_data = soup.find("ul", {"class": "ak-pagination"}).find_all("li")
        final_page_number = int(page_data[-1].find("a")["href"].split("=")[-1])

        # get all set ids from each page and write to csv
        set_ids = []
        for i in range(1, final_page_number + 1):
            url = (
                "https://www.dofus.com/en/mmorpg/encyclopedia/sets?size=96&page="
                + str(i)
            )
            soup = scraper_utils.get_soup(url)
            set_table = soup.find("table", {"class": "ak-table"}).tbody.find_all("tr")
            for set in set_table:
                id = set.find("a")["href"].split("/")[-1].split("-")[0]
                set_ids.append(id)
            print("Finished page " + str(i))

        with open("all_set_ids.csv", "w") as file:
            writer = csv.writer(file)
            writer.writerow(set_ids)

    def get_set_data(max_number_of_items):
        # get all set ids from csvfile
        all_set_ids = []
        with open("all_set_ids.csv") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_set_ids = row

        # for each id in the csv, start scraping for that id's info
        sets = []
        i = 0
        for id in all_set_ids:
            if i == max_number_of_items:
                break
            i = i + 1

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/sets/" + id
            soup = scraper_utils.get_soup(url)

            names = scraper_utils.get_alternate_names(soup, url)
            bonuses = scraper_utils.get_bonuses(soup)

            set = {"id": id, "name": names, "bonuses": bonuses}
            sets.append(set)
            print("Set " + str(i) + " complete")

        print("Writing set data to file")
        with open("sets.json", "w") as file:
            json.dump(sets, file)


class ClassScraper:
    def get_classes_from_page():
        url_response = requests.get(
            "https://www.dofus.com/en/mmorpg/encyclopedia/classes"
        )
        soup = BeautifulSoup(url_response.text, "html.parser")

        class_urls = []

        class_table = (
            soup.find("div", attrs={"class": "ak-content-sections"})
            .find("div", attrs={"class": "row"})
            .find_all("div", attrs={"class": "col-sm-6"})
        )

        for some_class in class_table:
            class_urls.append(
                "https://www.dofus.com"
                + some_class.find("div", attrs={"class": "ak-breed-section"}).a["href"]
            )

        return class_urls

    def get_class_info(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, "html.parser")

        name = "".join(url.split("-")[-1:]).capitalize()
        spells = []

        # get spell urls from class page
        spell_urls = []
        raw_spells = soup.find("div", attrs={"class": "ak-spell-list-row"}).find_all(
            "div", attrs={"class": "ak-spell-group"}
        )

        for spell in raw_spells:
            variant_urls = []
            raw_variants = spell.find_all("div", attrs={"class": "ak-list-block"})

            for variant in raw_variants:
                variant_urls.append(variant.a["href"])

            spell_urls.append(variant_urls)

        # get spell data

        return {"name": name, "spells": spells}


def __main__():
    # ItemScraper.get_all_item_ids()
    # ItemScraper.get_item_data(10)

    # SetScraper.get_all_set_ids()
    SetScraper.get_set_data(1000)


__main__()
