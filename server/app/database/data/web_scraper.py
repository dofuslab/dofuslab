import csv
import json
import os
import scraper_utils

dirname = os.path.dirname(os.path.abspath(__file__))


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

        with open(os.path.join(dirname, "all_item_ids.csv"), "w") as file:
            writer = csv.writer(file)
            writer.writerow(item_ids)

    def get_item_data(max_number_of_items):
        # get all item ids from csv
        all_item_ids = []
        with open(os.path.join(dirname, "all_item_ids.csv"), "r") as csvfile:
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
            # if i < 1800:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment/" + id
            soup = scraper_utils.get_soup(url)

            if (
                soup.find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                == None
            ):
                print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                # TODO: add logic to track and handle these id's

                continue

            names = scraper_utils.get_alternate_names(soup)
            item_type = soup.find(
                "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
            ).text[7:]
            level = soup.find(
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

            all_stats = scraper_utils.get_stats(soup, id)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(soup, item_type)

            item = {
                "dofusID": id,
                "name": names,
                "itemType": item_type,
                "setID": set,
                "level": int(level),
                "stats": stats,
                "customStats": custom_stats,
                "conditions": conditions,
                "imageUrl": image,
            }

            items.append(item)
            print("Item " + str(i) + " (id: {}) complete".format(id))

        with open(os.path.join(dirname, "items.json"), "w") as file:
            print("Writing item data to file")
            json.dump(items, file)

    # In case you still want to search up specific items, I've left the old methods
    def get_item_stats(url):
        url_response = requests.get(url)
        soup = BeautifulSoup(url_response.text, "html.parser")

        # get and clean data
        name = soup.find("h1", attrs={"class": "ak-return-link"}).text.strip()
        item_type = soup.find(
            "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
        ).text[7:]
        level = soup.find(
            "div", attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
        ).text[7:]
        image = soup.find("img", attrs={"class": "img-maxresponsive"})["src"]
        set = None
        try:
            set = (
                soup.find("div", attrs={"class": "ak-container ak-panel-stack ak-glue"})
                .find_all("div", attrs={"class": "ak-panel-title"})[3]
                .find("a")
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
            "div", {"class": "ak-container ak-content-list ak-displaymode-col"}
        )
        stats = []
        custom_stats = []

        for stat in raw_stats:
            description = stat.find_next("div", {"class": "ak-title"}).text.strip()

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
                arr = description.split(" ")
                min_stat = int(arr[0].replace("%", ""))
                max_stat = int(arr[2].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = " ".join(arr)
            elif "to" in description and "-" in description:
                arr = description.split(" ")
                min_stat = int(arr[2].replace("%", ""))
                max_stat = int(arr[0].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = " ".join(arr)
            else:
                arr = description.split(" ")
                max_stat = int(arr[0].replace("%", ""))
                del arr[0]
                type = " ".join(arr)

            if "%" in description and "Critical" not in description:
                type = "% " + type

            stats.append({"stat": type, "minStat": min_stat, "maxStat": max_stat})

        # Retrive item conditions
        raw_div = soup.find("div", attrs={"class": "ak-container ak-panel no-padding"})
        raw_conditions = None
        if raw_div and "Conditions" in raw_div.text:
            raw_conditions = raw_div
        conditions = []

        if raw_conditions:
            raw_conditions = (
                raw_conditions.text.strip().strip("Conditions").strip().split(" ")
            )
            stat_type = raw_conditions[0]
            condition_type = raw_conditions[1]
            limit = int(raw_conditions[2])

            conditions.append(
                {"statType": stat_type, "condition": condition_type, "limit": limit,}
            )

        item = {
            "name": name,
            "itemType": item_type,
            "set": set,
            "level": level,
            "stats": stats,
            "customStats": custom_stats,
            "conditions": conditions,
            "imageUrl": image,
        }

        return item

    def write_to_file(item_data):
        with open("items.json", "w") as outfile:
            json.dump(item_data, outfile)


class WeaponScraper:
    def get_all_weapon_ids():
        link = "https://www.dofus.com/en/mmorpg/encyclopedia/weapons?size=96"
        soup = scraper_utils.get_soup(link)

        page_data = soup.find("ul", {"class": "ak-pagination"}).find_all("li")
        final_page_number = int(page_data[-1].find("a")["href"].split("=")[-1])

        weapon_ids = []
        for i in range(1, final_page_number + 1):
            url = (
                "https://www.dofus.com/en/mmorpg/encyclopedia/weapons?size=96&page="
                + str(i)
            )
            soup = scraper_utils.get_soup(url)
            weapon_table = soup.find(
                "table", {"class": "ak-table ak-responsivetable"}
            ).tbody.find_all("tr")
            for weapon in weapon_table:
                id = weapon.find("a")["href"].split("/")[-1].split("-")[0]
                weapon_ids.append(id)
            print("Finished page " + str(i))

        with open(os.path.join(dirname, "all_weapon_ids.csv"), "w") as file:
            writer = csv.writer(file)
            writer.writerow(weapon_ids)

    def get_weapon_data(max_number_of_items):
        all_weapon_ids = []

        with open(os.path.join(dirname, "all_weapon_ids.csv"), "r") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_weapon_ids = row

        weapons = []
        i = 0
        for id in all_weapon_ids:
            if i == max_number_of_items:
                break
            # if int(id) != 9718:
            #     continue
            i = i + 1

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/weapons/" + id
            soup = scraper_utils.get_soup(url)

            if (
                soup.find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                == None
            ):
                print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                # TODO: add logic to track and handle these id's

                continue

            names = scraper_utils.get_alternate_names(soup)
            item_type = soup.find(
                "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
            ).text[7:]
            level = soup.find(
                "div", attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
            ).text[7:]
            image = soup.find("img", attrs={"class": "img-maxresponsive"})["src"]
            set = None
            try:
                set = (
                    soup.find(
                        "div", attrs={"class": "ak-container ak-panel-stack ak-glue"}
                    )
                    .find_all("div", attrs={"class": "ak-panel-title"})[-1]
                    .find("a")
                )

                set = set["href"].split("/")[-1].split("-")[0]
            except:
                # print("No set found for this item")
                pass

            all_stats = scraper_utils.get_stats(soup, id)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(soup, item_type)

            weapon_stats = scraper_utils.get_weapon_stats(soup)
            weapon_stats["weapon_effects"] = all_stats[2]

            weapon = {
                "dofusID": id,
                "name": names,
                "itemType": item_type,
                "level": int(level),
                "setID": set,
                "stats": stats,
                "weaponStats": weapon_stats,
                "customStats": custom_stats,
                "conditions": conditions,
                "imageUrl": image,
            }

            weapons.append(weapon)
            print("Item " + str(i) + " (id: {}) complete".format(id))

        with open(os.path.join(dirname, "weapons.json"), "w") as file:
            print("Writing weapon data to file")
            json.dump(weapons, file)


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

        with open(os.path.join(dirname, "all_set_ids.csv"), "w") as file:
            writer = csv.writer(file)
            writer.writerow(set_ids)

    def get_set_data(max_number_of_items):
        # get all set ids from csvfile
        all_set_ids = []

        with open(os.path.join(dirname, "all_set_ids.csv"), "r") as csvfile:
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

            names = scraper_utils.get_alternate_names(soup)
            bonuses = scraper_utils.get_bonuses(soup)

            set = {"id": id, "name": names, "bonuses": bonuses}
            sets.append(set)
            print("Set " + str(i) + " complete")

        print("Writing set data to file")
        with open(os.path.join(dirname, "sets.json"), "w") as file:
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


if __name__ == "__main__":
    # ItemScraper.get_all_item_ids()
    # ItemScraper.get_item_data(3000)

    # SetScraper.get_all_set_ids()
    # SetScraper.get_set_data(1000)

    # WeaponScraper.get_all_weapon_ids()
    WeaponScraper.get_weapon_data(1000)
