import csv
import json
import os
import scraper_utils

dirname = os.path.dirname(os.path.abspath(__file__))

missingItems = ["19595", "19263", "13641", "16267", "6712", "2531", "8629"]
missingWeapons = ["18018", "6524"]


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

    def get_all_item_data(max_number_of_items):
        # get all item ids from csv
        all_item_ids = []
        with open(os.path.join(dirname, "all_item_ids.csv"), "r") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_item_ids = row

        # for each id in the csv, start scraping for that id's info
        items = []
        missed_items = []
        i = 0
        for id in all_item_ids:
            # early exit for now as to avoid scraping 2000+ items
            if i == max_number_of_items:
                break
            i = i + 1
            # if int(id) != 15157:
            #     continue
            # if i < 1800:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                    missed_items.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            item_type = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                .text[7:]
            )
            level = (
                all_soups["en"]
                .find(
                    "div",
                    attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
                )
                .text[7:]
            )
            image = all_soups["en"].find("img", attrs={"class": "img-maxresponsive"})[
                "src"
            ]
            set = None
            divs = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-container ak-panel-stack ak-glue"})
                .find_all("div", attrs={"class": "ak-container ak-panel"})
            )
            for div in divs:
                if "is part of the" in div.text:
                    set = div.find("a")["href"].split("/")[-1].split("-")[0]
                    break

            all_stats = scraper_utils.get_stats(all_soups)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(all_soups, item_type)

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

        print(missed_items)
        return missed_items

    def get_data_for_id(id_list):
        data = None
        # with open("items.json") as json_file:
        #     data = json.load(json_file)

        for id in id_list:
            # early exit for now as to avoid scraping 2000+ items
            if i == max_number_of_items:
                break
            i = i + 1
            # if int(id) != 15157:
            #     continue
            # if i < 1800:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/equipment/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                    missed_items.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            item_type = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                .text[7:]
            )
            level = (
                all_soups["en"]
                .find(
                    "div",
                    attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
                )
                .text[7:]
            )
            image = all_soups["en"].find("img", attrs={"class": "img-maxresponsive"})[
                "src"
            ]
            set = None
            try:
                set = (
                    all_soups["en"]
                    .find("div", attrs={"class": "ak-container ak-panel-stack ak-glue"})
                    .find_all("div", attrs={"class": "ak-panel-title"})[3]
                    .find("a")
                )
                set = set["href"].split("/")[-1].split("-")[0]
            except:
                # print("No set found for this item")
                pass

            all_stats = scraper_utils.get_stats(all_soups)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(all_soups, item_type)

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
        missed_weapons = []
        i = 0
        for id in all_weapon_ids:
            if i == max_number_of_items:
                break
            # if int(id) != 2416:
            #     continue
            i = i + 1

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/weapons/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                    missed_weapons.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            item_type = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                .text[7:]
            )
            level = (
                all_soups["en"]
                .find(
                    "div",
                    attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
                )
                .text[7:]
            )
            image = all_soups["en"].find("img", attrs={"class": "img-maxresponsive"})[
                "src"
            ]
            set = None
            divs = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-container ak-panel-stack ak-glue"})
                .find_all("div", attrs={"class": "ak-container ak-panel"})
            )
            for div in divs:
                if "is part of the" in div.text:
                    set = div.find("a")["href"].split("/")[-1].split("-")[0]
                    break

            all_stats = scraper_utils.get_stats(all_soups)
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(all_soups, item_type)

            weapon_stats = scraper_utils.get_weapon_stats(all_soups["en"])
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

        print(missed_weapons)
        return missed_weapons


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
        missed_sets = []
        i = 0
        for id in all_set_ids:
            if i == max_number_of_items:
                break
            i = i + 1
            # if int(id) != 204:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/sets/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping set (id: {}) ----".format(id))
                    missed_sets.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            bonuses = scraper_utils.get_bonuses(all_soups)

            set = {"id": id, "name": names, "bonuses": bonuses}
            sets.append(set)
            print("Set " + str(i) + " (id: {}) complete".format(id))

        print("Writing set data to file")
        with open(os.path.join(dirname, "sets.json"), "w") as file:
            json.dump(sets, file)


class PetScraper:
    def get_all_pet_ids():
        url = "https://www.dofus.com/en/mmorpg/encyclopedia/pets?size=96"
        soup = scraper_utils.get_soup(url)
        page_data = soup.find("ul", {"class": "ak-pagination"}).find_all("li")
        final_page_number = int(page_data[-1].find("a")["href"].split("=")[-1])

        item_ids = []
        for i in range(1, final_page_number + 1):
            url = (
                "https://www.dofus.com/en/mmorpg/encyclopedia/pets?size=96&page="
                + str(i)
            )
            soup = scraper_utils.get_soup(url)
            item_table = soup.find("table", {"class": "ak-table"}).tbody.find_all("tr")
            for item in item_table:
                id = item.find("a")["href"].split("/")[-1].split("-")[0]
                item_ids.append(id)
            print("Finished page " + str(i))

        with open(os.path.join(dirname, "all_pet_ids.csv"), "w") as file:
            writer = csv.writer(file)
            writer.writerow(item_ids)

    def get_all_pet_data(max_number_of_items):
        all_pet_ids = []
        with open(os.path.join(dirname, "all_pet_ids.csv"), "r") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_pet_ids = row

        pets = []
        missed_pets = []
        i = 0
        for id in all_pet_ids:
            if i == max_number_of_items:
                break
            i = i + 1
            # if int(id) != 2077:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/pets/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                    missed_pets.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            item_type = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-encyclo-detail-type col-xs-6"})
                .text[7:]
            )
            level = (
                all_soups["en"]
                .find(
                    "div",
                    attrs={"class": "ak-encyclo-detail-level col-xs-6 text-right"},
                )
                .text[7:]
            )
            image = all_soups["en"].find("img", attrs={"class": "img-maxresponsive"})[
                "src"
            ]
            set = None
            divs = (
                all_soups["en"]
                .find("div", attrs={"class": "ak-container ak-panel-stack ak-glue"})
                .find_all("div", attrs={"class": "ak-container ak-panel"})
            )
            for div in divs:
                if "is part of the" in div.text:
                    set = div.find("a")["href"].split("/")[-1].split("-")[0]
                    break
            all_stats = scraper_utils.get_pet_stats()
            stats = all_stats[0]
            custom_stats = all_stats[1]
            conditions = scraper_utils.get_conditions(all_soups, item_type)

            pet = {
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

            pets.append(pet)
            print("Item " + str(i) + " (id: {}) complete".format(id))

        with open(os.path.join(dirname, "pets.json"), "w") as file:
            print("Writing item data to file")
            json.dump(pets, file)

        print(missed_pets)
        return missed_pets


class MountScraper:
    def get_all_mount_ids():
        url = "https://www.dofus.com/en/mmorpg/encyclopedia/mounts?size=96"
        soup = scraper_utils.get_soup(url)
        page_data = soup.find("ul", {"class": "ak-pagination"}).find_all("li")
        final_page_number = int(page_data[-1].find("a")["href"].split("=")[-1])

        mount_ids = []
        for i in range(1, final_page_number + 1):
            url = (
                "https://www.dofus.com/en/mmorpg/encyclopedia/mounts?size=96&page="
                + str(i)
            )
            soup = scraper_utils.get_soup(url)
            item_table = soup.find("table", {"class": "ak-table"}).tbody.find_all("tr")
            for item in item_table:
                id = item.find("a")["href"].split("/")[-1].split("-")[0]
                mount_ids.append(id)
            print("Finished page " + str(i))

        with open(os.path.join(dirname, "all_mount_ids.csv"), "w") as file:
            writer = csv.writer(file)
            writer.writerow(mount_ids)

    def get_all_mount_data(max_number_of_items):
        all_mount_ids = []
        with open(os.path.join(dirname, "all_mount_ids.csv"), "r") as csvfile:
            data = csv.reader(csvfile, delimiter=",")
            for row in data:
                all_mount_ids = row

        mounts = []
        missed_mounts = []
        i = 0
        for id in all_mount_ids:
            if i == max_number_of_items:
                break
            i = i + 1
            # if int(id) != 2077:
            #     continue

            url = "https://www.dofus.com/en/mmorpg/encyclopedia/mounts/" + id
            all_soups = scraper_utils.get_all_localized_soup(url)

            is_404 = False
            for key, value in all_soups.items():
                if (
                    value.find(
                        "div", attrs={"class": "ak-encyclo-detail-type col-xs-6"}
                    )
                    == None
                ):
                    print("---- Item 404'd, skipping item (id: {}) ----".format(id))
                    missed_mounts.append(id)
                    is_404 = True

                    break

            if is_404:
                continue

            names = scraper_utils.get_alternate_names(all_soups)
            item_type = "Mount"
            level = 60
            image = all_soups["en"].find("img", attrs={"class": "img-maxresponsive"})[
                "src"
            ]
            all_stats = scraper_utils.get_stats(all_soups)
            stats = all_stats[0]
            custom_stats = all_stats[1]

            mount = {
                "dofusID": id,
                "name": names,
                "itemType": item_type,
                "level": int(level),
                "stats": stats,
                "customStats": custom_stats,
                "imageUrl": image,
            }

            mounts.append(mount)
            print("Item " + str(i) + " (id: {}) complete".format(id))

        with open(os.path.join(dirname, "mounts.json"), "w") as file:
            print("Writing item data to file")
            json.dump(mounts, file)

        print(missed_mounts)
        return missed_mounts


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
    # ItemScraper.get_all_item_data(3000)

    # SetScraper.get_all_set_ids()
    # SetScraper.get_set_data(1000)

    # WeaponScraper.get_all_weapon_ids()
    # WeaponScraper.get_weapon_data(1000)

    # PetScraper.get_all_pet_ids()
    # PetScraper.get_all_pet_data(1000)

    # MountScraper.get_all_mount_ids()
    MountScraper.get_all_mount_data(3000)
