import csv
import json
import os
import scraper_utils
import re

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

    def get_data_for_ids(id_list=[]):
        if id_list == []:
            with open(os.path.join(dirname, "all_item_ids.csv"), "r") as csvfile:
                data = csv.reader(csvfile, delimiter=",")
                for row in data:
                    id_list = row

        data = None
        with open(os.path.join(dirname, "items.json"), "r") as json_file:
            data = json.load(json_file)

        missed_items = []

        for id in id_list:
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
            scraper_utils.download_image(id, image, "items")
            scraper_utils.upload_image_to_s3(
                os.path.join(scraper_utils.image_folder, "items", image.split("/")[-1]),
                "item",
            )
            image = "item/" + image.split("/")[-1]

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

            data.append(item)
            print("Item (id: {}) complete".format(id))

        with open(os.path.join(dirname, "items.json"), "w") as json_file:
            json.dump(data, json_file)

        if missed_items == []:
            print("All item data successfully retrieved.")
        else:
            print("Some data was not successfully retrieved: {}".format(missed_items))


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

    def get_data_for_ids(id_list=[]):
        if id_list == []:
            with open(os.path.join(dirname, "all_weapon_ids.csv"), "r") as csvfile:
                data = csv.reader(csvfile, delimiter=",")
                for row in data:
                    id_list = row

        data = None
        with open(os.path.join(dirname, "weapons.json"), "r") as json_file:
            data = json.load(json_file)

        missed_weapons = []

        for id in id_list:
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
            scraper_utils.download_image(id, image, "items")
            scraper_utils.upload_image_to_s3(
                os.path.join(scraper_utils.image_folder, "items", id + ".png"), "item"
            )
            image = "item/" + id + ".png"

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

            data.append(weapon)
            print("Item (id: {}) complete".format(id))

        with open(os.path.join(dirname, "weapons.json"), "w") as json_file:
            json.dump(data, json_file)

        if missed_weapons == []:
            print("All weapon data successfully retrieved.")
        else:
            print("Some data was not successfully retrieved: {}".format(missed_weapons))


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

    def get_set_data_for_ids(id_list=[]):
        if id_list == []:
            with open(os.path.join(dirname, "all_set_ids.csv"), "r") as csvfile:
                data = csv.reader(csvfile, delimiter=",")
                for row in data:
                    id_list = row

        data = None
        with open(os.path.join(dirname, "sets.json"), "r") as json_file:
            data = json.load(json_file)

        missed_sets = []

        for id in id_list:
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
            data.append(set)
            print("Set " + str(i) + " (id: {}) complete".format(id))

        print("Writing set data to file")
        with open(os.path.join(dirname, "sets.json"), "w") as file:
            json.dump(sets, file)

        if missed_sets == []:
            print("All set data successfully retrieved.")
        else:
            print("Some data was not successfully retrieved: {}".format(missed_sets))


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

    def get_pet_data_for_ids(id_list=[]):
        if id_list == []:
            with open(os.path.join(dirname, "all_pet_ids.csv"), "r") as csvfile:
                data = csv.reader(csvfile, delimiter=",")
                for row in data:
                    id_list = row

        data = None
        with open(os.path.join(dirname, "pets.json"), "r") as json_file:
            data = json.load(json_file)

        missed_pets = []

        for id in id_list:
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
            scraper_utils.download_image(id, image, "items")
            scraper_utils.upload_image_to_s3(
                os.path.join(scraper_utils.image_folder, "items", id + ".png"), "item"
            )
            image = "item/" + id + ".png"

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
            all_stats = scraper_utils.get_pet_stats(id)
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

        if missed_pets == []:
            print("All pet data successfully retrieved.")
        else:
            print("Some data was not successfully retrieved: {}".format(missed_pets))


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

    def get_mount_data_for_ids(id_list=[]):
        if id_list == []:
            with open(os.path.join(dirname, "all_mounts_ids.csv"), "r") as csvfile:
                data = csv.reader(csvfile, delimiter=",")
                for row in data:
                    id_list = row

        data = None
        with open(os.path.join(dirname, "mounts.json"), "r") as json_file:
            data = json.load(json_file)

        missed_mounts = []

        for id in all_mount_ids:
            wild_mount_ids = [1, 6, 74, 167, 168, 169, 170, 171]
            if int(id) in wild_mount_ids:
                continue

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
            scraper_utils.download_image(id, image, "items")
            scraper_utils.upload_image_to_s3(
                os.path.join(scraper_utils.image_folder, "items", id + ".png"), "item"
            )
            image = "item/" + id + ".png"

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

        if missed_mounts == []:
            print("All mount data successfully retrieved.")
        else:
            print("Some data was not successfully retrieved: {}".format(missed_mounts))


class ClassScraper:
    def get_data_for_class(self, url):
        soup = scraper_utils.get_soup(url)
        class_name = "".join(url.split("-")[-1:]).capitalize()

        class_names = {}
        class_names["en"] = class_name
        raw_names = soup.find("head").find_all("link", {"rel": "alternate"})
        for name in raw_names:
            name = name["href"]
            if "dofus" in name:
                class_names[name.split("/")[3]] = name.split("-")[-1].capitalize()

        print("Getting spells for {}".format(class_name))

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
                id = variant.a["href"].split("=")[1].split("&")[0]
                variant_urls.append(id)

            spell_urls.append(variant_urls)

        # get spell data
        base_spell_url = (
            "https://www.dofus.com/en/mmorpg/encyclopedia/spells/details?id="
        )
        num_spells = 1
        for spell_pair in spell_urls:
            variant = []
            for spell_id in spell_pair:
                spell_data = {}
                spell_url = base_spell_url + spell_id + "&level=1&selector=1"
                all_soups = scraper_utils.get_all_localized_soup(spell_url)

                spell_names = {}
                for key, value in all_soups.items():
                    spell_info = value.find(
                        "h2", {"class": "ak-spell-name"}
                    ).text.split("\n")
                    spell_names[key] = spell_info[1]

                spell_description = {}
                for key, value in all_soups.items():
                    description = value.find(
                        "span", {"class": "ak-spell-description"}
                    ).text.replace("\n", " ")
                    spell_description[key] = description

                image_url = (
                    all_soups["en"]
                    .find("div", {"class": "ak-spell-details-illu"})
                    .find("img")["src"]
                )
                scraper_utils.download_image(id, image_url, "spells")
                scraper_utils.upload_image_to_s3(
                    os.path.join(scraper_utils.image_folder, "spells", id + ".png"),
                    "spell",
                )
                image_url = "spell/" + id + ".png"

                levels = (
                    all_soups["en"]
                    .find(
                        "div",
                        {"class": "ak-spell-details-level-selector ak-ajaxloader"},
                    )
                    .find_all("a")
                )
                effects = []
                for i in range(1, len(levels) + 1):
                    level = levels[i - 1].text
                    url_for_level = base_spell_url + spell_id + "&level=" + str(i)
                    soups_for_level = scraper_utils.get_all_localized_soup(
                        url_for_level
                    )

                    ap_cost = (
                        soups_for_level["en"]
                        .find("h2", {"class", "ak-spell-name"})
                        .text.split("\n")[-1]
                        .split("/")[1]
                        .strip("AP")
                        .strip()
                    )

                    spell_range = {"minRange": None, "maxRange": None}
                    raw_range = (
                        soups_for_level["en"]
                        .find("h2", {"class", "ak-spell-name"})
                        .text.split("\n")[-1]
                        .split("/")[0]
                    )
                    if "-" in raw_range:
                        ranges = re.findall(r"\d+", raw_range)
                        spell_range["minRange"] = int(ranges[0])
                        spell_range["maxRange"] = int(ranges[1])
                    else:
                        ranges = re.findall(r"\d+", raw_range)
                        spell_range["minRange"] = 0
                        spell_range["maxRange"] = int(ranges[0])

                    raw_characteristics = soups_for_level["en"].find(
                        "div", {"class": "ak-spell-details-other clearfix"}
                    )
                    stat_types = raw_characteristics.find_all(
                        "div", {"class": "ak-title"}
                    )
                    stat_values = raw_characteristics.find_all(
                        "div", {"class": "ak-aside"}
                    )

                    cooldown = None
                    crit_rate = None
                    casts_per_player = None
                    casts_per_turn = None
                    need_los = None
                    modifiable_range = None
                    is_linear = None
                    needs_free_cell = None
                    aoe_type = None

                    for j in range(len(stat_types)):
                        stat_type = stat_types[j].text.strip()
                        if "Probability of Critical Hit" in stat_type:
                            crit_rate = stat_values[j].text.strip().replace("%", "")
                        elif "Casts per turn" in stat_type:
                            casts_per_turn = stat_values[j].text.strip()
                        elif "Casts per player per turn" in stat_type:
                            casts_per_player = stat_values[j].text.strip()
                        elif "Modifiable range" in stat_type:
                            if stat_values[j].text.strip() == "Yes":
                                modifiable_range = True
                            else:
                                modifiable_range = False
                        elif "Line of sight" in stat_type:
                            if stat_values[j].text.strip() == "Yes":
                                need_los = True
                            else:
                                need_los = False
                        elif "Cast in a straight line only" in stat_type:
                            if stat_values[j].text.strip() == "Yes":
                                is_linear = True
                            else:
                                is_linear = False
                        elif "Free cells" in stat_type:
                            if stat_values[j].text.strip() == "Yes":
                                needs_free_cell = True
                            else:
                                needs_free_cell = False
                        elif "Turns between two casts" in stat_type:
                            cooldown = stat_values[j].text.strip()
                        elif "Area of Effect" in stat_type:
                            aoe_type = {
                                "en": None,
                                "fr": None,
                                "de": None,
                                "es": None,
                                "it": None,
                                "pt": None,
                            }
                            for key, value in soups_for_level.items():
                                aoe_type[key] = (
                                    value.find(
                                        "div",
                                        {"class": "ak-spell-details-other clearfix"},
                                    )
                                    .find("div", {"class": "ak-text"})
                                    .text
                                )
                        else:
                            print("Other characteristic found: {}".format(stat_type))

                    spell_effects = "|".join(
                        [
                            "Neutral damage",
                            "Earth damage",
                            "Fire damage",
                            "Water damage",
                            "Air damage",
                            "Neutral steal",
                            "Earth steal",
                            "Fire steal",
                            "Water steal",
                            "Air steal",
                            "HP restored",
                        ]
                    )

                    spell_effects_2 = "|".join(["level to shield", "Pushes back",])

                    normal_effects = {"modifiableEffect": [], "customEffect": {}}
                    spell_stats = (
                        soups_for_level["en"]
                        .find(
                            "div",
                            {
                                "class": "ak-container ak-content-list ak-displaymode-col"
                            },
                        )
                        .find_all("div", {"class", "ak-title"})
                    )

                    i = 0
                    for spell_stat in spell_stats:
                        spell_stat = spell_stat.text.strip()

                        type = None
                        min_stat = None
                        max_stat = None

                        if re.search(
                            r"\d+ \((?:{})\)".format(spell_effects), spell_stat
                        ):
                            spell_stat = re.sub(r"\s\(\d turns\)", "", spell_stat)
                            if re.search(r"\d to \d", spell_stat):
                                arr = (
                                    spell_stat.replace("(", "")
                                    .strip(")")
                                    .strip()
                                    .split(" ")
                                )
                                type = " ".join(arr[3:])
                                min_stat = int(arr[0])
                                max_stat = int(arr[2])
                            else:
                                arr = spell_stat.replace("(", "").strip(")").split(" ")
                                type = " ".join(arr[1:])
                                max_stat = int(arr[0])

                            normal_effects["modifiableEffect"].append(
                                {
                                    "stat": type,
                                    "minStat": min_stat,
                                    "maxStat": max_stat,
                                }
                            )
                            i = i + 1
                        elif re.search(r"(?:{})".format(spell_effects_2), spell_stat):
                            if "shield" in spell_stat:
                                type = "Shield"
                                max_stat = spell_stat.split(" ")[0].strip("%")
                            elif "Pushes back" in spell_stat:
                                type = "Pushback damage"
                                max_stat = spell_stat.split(" ")[2]

                            normal_effects["modifiableEffect"].append(
                                {
                                    "stat": type,
                                    "minStat": min_stat,
                                    "maxStat": max_stat,
                                }
                            )
                            i = i + 1
                        else:
                            if normal_effects["customEffect"] == {}:
                                normal_effects["customEffect"] = {
                                    "en": [],
                                    "fr": [],
                                    "de": [],
                                    "es": [],
                                    "it": [],
                                    "pt": [],
                                }

                            for key, value in soups_for_level.items():
                                custom_effect = (
                                    value.find(
                                        "div",
                                        {
                                            "class": "ak-container ak-content-list ak-displaymode-col"
                                        },
                                    )
                                    .find_all("div", {"class", "ak-title"})[i]
                                    .text.strip()
                                )
                                normal_effects["customEffect"][key].append(
                                    custom_effect
                                )

                            i = i + 1

                    critical_effects = {}
                    spell_stats = soups_for_level["en"].find_all(
                        "div",
                        {"class": "ak-container ak-content-list ak-displaymode-col"},
                    )
                    if len(spell_stats) > 2:
                        critical_effects = {"modifiableEffect": [], "customEffect": {}}
                        spell_stats = spell_stats[1].find_all(
                            "div", {"class", "ak-title"}
                        )

                        i = 0
                        for spell_stat in spell_stats:
                            spell_stat = spell_stat.text.strip()

                            type = None
                            min_stat = None
                            max_stat = None

                            if re.search(
                                r"\d+ \((?:{})\)".format(spell_effects), spell_stat
                            ):
                                spell_stat = re.sub(r"\s\(\d turns\)", "", spell_stat)
                                if re.search(r"\d to \d", spell_stat):
                                    arr = (
                                        spell_stat.replace("(", "")
                                        .strip(")")
                                        .split(" ")
                                    )
                                    type = " ".join(arr[3:])
                                    min_stat = int(arr[0])
                                    max_stat = int(arr[2])
                                else:
                                    arr = (
                                        spell_stat.replace("(", "")
                                        .strip(")")
                                        .split(" ")
                                    )
                                    type = " ".join(arr[1:])
                                    max_stat = int(arr[0])

                                critical_effects["modifiableEffect"].append(
                                    {
                                        "stat": type,
                                        "minStat": min_stat,
                                        "maxStat": max_stat,
                                    }
                                )
                                i = i + 1
                            elif re.search(
                                r"(?:{})".format(spell_effects_2), spell_stat
                            ):
                                if "shield" in spell_stat:
                                    type = "Shield"
                                    max_stat = spell_stat.split(" ")[0].strip("%")
                                elif "Pushes back" in spell_stat:
                                    type = "Pushback damage"
                                    max_stat = spell_stat.split(" ")[2]

                                critical_effects["modifiableEffect"].append(
                                    {
                                        "stat": type,
                                        "minStat": min_stat,
                                        "maxStat": max_stat,
                                    }
                                )
                                i = i + 1
                            else:
                                if critical_effects["customEffect"] == {}:
                                    critical_effects["customEffect"] = {
                                        "en": [],
                                        "fr": [],
                                        "de": [],
                                        "es": [],
                                        "it": [],
                                        "pt": [],
                                    }

                                for key, value in soups_for_level.items():
                                    custom_effect = (
                                        value.find_all(
                                            "div",
                                            {
                                                "class": "ak-container ak-content-list ak-displaymode-col"
                                            },
                                        )[1]
                                        .find_all("div", {"class", "ak-title"})[i]
                                        .text.strip()
                                    )
                                    critical_effects["customEffect"][key].append(
                                        custom_effect
                                    )

                                i = i + 1

                    effect = {
                        "level": level,
                        "apCost": ap_cost,
                        "cooldown": cooldown,
                        "baseCritRate": crit_rate,
                        "castsPerPlayer": casts_per_player,
                        "castsPerTurn": casts_per_turn,
                        "needLos": need_los,
                        "modifiableRange": modifiable_range,
                        "isLinear": is_linear,
                        "needsFreeCell": needs_free_cell,
                        "aoeType": aoe_type,
                        "spellRange": spell_range,
                        "normalEffects": normal_effects,
                        "criticalEffects": critical_effects,
                    }
                    effects.append(effect)

                spell_data["name"] = spell_names
                spell_data["description"] = spell_description
                spell_data["imageUrl"] = image_url
                spell_data["effects"] = effects

                variant.append(spell_data)

                print("Spell " + str(num_spells) + " finished. ID: {}".format(spell_id))
                num_spells = num_spells + 1

            spells.append(variant)

        class_info = {"names": class_names, "spells": spells}
        all_class_info = None

        with open(os.path.join(dirname, "spells.json"), "r") as json_file:
            all_class_info = json.load(json_file)
            all_class_info.append(class_info)

        with open(os.path.join(dirname, "spells.json"), "w") as file:
            print("Writing spell data to file")
            json.dump(all_class_info, file)

    def get_data_for_classes(self, classes):
        all_urls = {
            "Feca": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/1-feca",
            "Osamodas": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/2-osamodas",
            "Enutrof": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/3-enutrof",
            "Sram": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/4-sram",
            "Xelor": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/5-xelor",
            "Ecaflip": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/6-ecaflip",
            "Eniripsa": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/7-eniripsa",
            "Iop": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/8-iop",
            "Cra": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/9-cra",
            "Sadida": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/10-sadida",
            "Sacrier": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/11-sacrier",
            "Pandawa": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/12-pandawa",
            "Rogue": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/13-rogue",
            "Masqueraider": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/14-masqueraider",
            "Foggernaut": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/15-foggernaut",
            "Eliotrope": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/16-eliotrope",
            "Huppermage": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/17-huppermage",
            "Ouginak": "https://www.dofus.com/en/mmorpg/encyclopedia/classes/18-ouginak",
        }

        for class_name in classes:
            self.get_data_for_class(all_urls[class_name])


class DataAdjustment:
    def add_missing_trophy_conditions():
        ids = [
            16328,
            16266,
            16338,
            16189,
            16275,
            16186,
            16315,
            16253,
            16301,
            16293,
            16305,
            16322,
            16259,
            16250,
            16203,
            16247,
            16329,
            16267,
            16339,
            16190,
            16281,
            16187,
            16316,
            16254,
            16302,
            16294,
            16306,
            16323,
            16260,
            16251,
            16204,
            16248,
            16193,
            16313,
            16320,
            13777,
            16184,
            16196,
            16310,
            16284,
            16245,
            16332,
            16326,
            16264,
            16327,
            16265,
            16337,
            16188,
            16274,
            16185,
            16314,
            16252,
            16300,
            16292,
            16303,
            16321,
            16258,
            16202,
            16246,
            16191,
            16311,
            16318,
            16255,
            16182,
            16194,
            16308,
            16282,
            16243,
            16330,
            16324,
            16262,
            16192,
            16312,
            16319,
            12695,
            16335,
            16336,
            16183,
            16195,
            16333,
            16309,
            16283,
            16244,
            16331,
            16325,
            16263,
        ]

        data = None
        with open(os.path.join(dirname, "items.json"), "r") as json_file:
            data = json.load(json_file)

        for i in range(len(data)):
            if int(data[i]["dofusID"]) in ids:
                data[i]["conditions"] = {
                    "conditions": {
                        "and": [{"stat": "SET_BONUS", "operator": "<", "value": 2}]
                    },
                    "customConditions": {},
                }

        with open(os.path.join(dirname, "items.json"), "w") as json_file:
            json.dump(data, json_file)

    def add_missing_item_details():
        data = None
        with open(os.path.join(dirname, "items.json"), "r") as json_file:
            data = json.load(json_file)

        for i in range(len(data)):
            # Ivory Dofus
            if data[i]["dofusID"] == "7115":
                data[i]["stats"] = [
                    {"stat": "Neutral Resistance", "minStat": None, "maxStat": 40},
                    {"stat": "Earth Resistance", "minStat": None, "maxStat": 40},
                    {"stat": "Fire Resistance", "minStat": None, "maxStat": 40},
                    {"stat": "Water Resistance", "minStat": None, "maxStat": 40},
                    {"stat": "Air Resistance", "minStat": None, "maxStat": 40},
                ]
                data[i]["customStats"]["en"] = [
                    "At the end of the turn, damage from the next attack suffered is reduced by 50%."
                ]
            # Ebony Dofus
            elif data[i]["dofusID"] == "7114":
                data[i]["stats"] = [
                    {"stat": "Dodge", "minStat": None, "maxStat": 40},
                ]
                data[i]["customStats"]["en"] = [
                    "Generates 1 first charge at the start of the turn, 1 second charge upon inflicting close-combat damage, and 1 third charge upon inflicting ranged damage.\n\nOnce 5 charges are reached, the next attack consumes the charges and applies a poison to the target for 3 turns.\n\n Each charge gives a 2% final damage inflicted bonus."
                ]
            # Sparkling Silver Dofus
            elif data[i]["dofusID"] == "20286":
                data[i]["customStats"]["en"] = [
                    "At the start of the caster's turn, if they have less than 20% HP, they gare healed 40% HP and gain 20% final damage for the current turn. This effect can only be played once per fight."
                ]

        with open(os.path.join(dirname, "items.json"), "w") as json_file:
            json.dump(data, json_file)

    # will integrate this directly into scraper. just didnt want to wait for it to scrape
    def change_condition_case():
        stat_conversions = {
            "Vitality": "VITALITY",
            "AP": "AP",
            "MP": "MP",
            "Initiative": "INITIATIVE",
            "Prospecting": "PROSPECTING",
            "Range": "RANGE",
            "Summons": "SUMMON",
            "Wisdom": "WISDOM",
            "Strength": "STRENGTH",
            "Intelligence": "INTELLIGENCE",
            "Chance": "CHANCE",
            "Agility": "AGILITY",
            "AP Parry": "AP_PARRY",
            "AP Reduction": "AP_REDUCTION",
            "MP Parry": "MP_PARRY",
            "MP Reduction": "MP_REDUCTION",
            "Critical": "CRITICAL",
            "Heals": "HEALS",
            "Lock": "LOCK",
            "Dodge": "DODGE",
            "Power": "POWER",
            "Damage": "DAMAGE",
            "Critical Damage": "CRITICAL_DAMAGE",
            "Neutral Damage": "NEUTRAL_DAMAGE",
            "Earth Damage": "EARTH_DAMAGE",
            "Fire Damage": "FIRE_DAMAGE",
            "Water Damage": "WATER_DAMAGE",
            "Air Damage": "AIR_DAMAGE",
            "Reflect": "REFLECT",
            "Trap Damage": "TRAP_DAMAGE",
            "Power (traps)": "TRAP_POWER",
            "Pushback Damage": "PUSHBACK_DAMAGE",
            "% Spell Damage": "PCT_SPELL_DAMAGE",
            "% Weapon Damage": "PCT_WEAPON_DAMAGE",
            "% Ranged Damage": "PCT_RANGED_DAMAGE",
            "% Melee Damage": "PCT_MELEE_DAMAGE",
            "Neutral Resistance": "NEUTRAL_RES",
            "% Neutral Resistance": "PCT_NEUTRAL_RES",
            "Earth Resistance": "EARTH_RES",
            "% Earth Resistance": "PCT_EARTH_RES",
            "Fire Resistance": "FIRE_RES",
            "% Fire Resistance": "PCT_FIRE_RES",
            "Water Resistance": "WATER_RES",
            "% Water Resistance": "PCT_WATER_RES",
            "Air Resistance": "AIR_RES",
            "% Air Resistance": "PCT_AIR_RES",
            "Critical Resistance": "CRITICAL_RES",
            "Pushback Resistance": "PUSHBACK_RES",
            "% Ranged Resistance": "PCT_RANGED_RES",
            "% Melee Resistance": "PCT_MELEE_RES",
            "pods": "PODS",
        }

        files = ["weapons.json", "items.json"]
        for file in files:
            data = None
            with open(os.path.join(dirname, file), "r") as json_file:
                data = json.load(json_file)

            for i in range(len(data)):
                if data[i]["dofusID"] == "14166":
                    continue
                print(data[i]["name"]["en"])
                for j in range(len(data[i]["conditions"]["conditions"].get("and", []))):
                    stat = data[i]["conditions"]["conditions"]["and"][j]["stat"]
                    if stat == "SET_BONUS":
                        continue
                    data[i]["conditions"]["conditions"]["and"][j][
                        "stat"
                    ] = stat_conversions[stat]

                for j in range(len(data[i]["conditions"]["conditions"].get("or", []))):
                    stat = data[i]["conditions"]["conditions"]["or"][j]["stat"]
                    if stat == "SET_BONUS":
                        continue
                    data[i]["conditions"]["conditions"]["or"][j][
                        "stat"
                    ] = stat_conversions[stat]

            with open(os.path.join(dirname, file), "w") as json_file:
                json.dump(data, json_file)


if __name__ == "__main__":
    ItemScraper.get_all_item_ids()
    ItemScraper.get_data_for_ids([])

    SetScraper.get_all_set_ids()
    SetScraper.get_set_data_for_ids()

    WeaponScraper.get_all_weapon_ids()
    WeaponScraper.get_data_for_ids([])

    PetScraper.get_all_pet_ids()
    PetScraper.get_pet_data_for_ids()

    MountScraper.get_all_mount_ids()
    MountScraper.get_mount_data_for_ids()

    class_scraper = ClassScraper()
    class_scraper.get_data_for_classes([])

    DataAdjustment.add_missing_trophy_conditions()
    DataAdjustment.add_missing_item_details()
    DataAdjustment.change_condition_case()
