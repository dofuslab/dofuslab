import requests
import re
import unicodedata
from bs4 import BeautifulSoup


class Constants:
    all_stats = "|".join(
        [
            "Vitality",
            "AP",
            "MP",
            "Initiative",
            "Prospecting",
            "Range",
            "Summons",
            "Wisdom",
            "Strength",
            "Intelligence",
            "Chance",
            "Agility",
            "AP Parry",
            "AP Reduction",
            "MP Parry",
            "MP Reduction",
            "Critical",
            "Heals",
            "Lock",
            "Dodge",
            "Power",
            "Damage",
            "Critical Damage",
            "Neutral Damage",
            "Earth Damage",
            "Fire Damage",
            "Water Damage",
            "Air Damage",
            "Reflect",
            "Trap Damage",
            "Power \(traps\)",
            "Pushback Damage",
            "Spell Damage",
            "Weapon Damage",
            "Ranged Damage",
            "Melee Damage",
            "Neutral Resistance",
            "Earth Resistance",
            "Fire Resistance",
            "Water Resistance",
            "Air Resistance",
            "Critical Resistance",
            "Pushback Resistance",
            "Ranged Resistance",
            "Melee Resistance",
            "pods",
        ]
    )
    all_weapon_effects = "|".join(
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

    weapon_types = [
        "Axe",
        "Bow",
        "Dagger",
        "Hammer",
        "Pickaxe",
        "Scythe",
        "Shovel",
        "Staff",
        "Sword",
        "Tool",
        "Wand",
    ]


def get_soup(url):
    url_response = requests.get(url)
    soup = BeautifulSoup(url_response.text, "html.parser")
    return soup


def get_all_localized_soup(url):
    soup = get_soup(url)

    all_soups = {}

    all_links = {}
    unparsed_links = soup.find("head").find_all("link", {"rel": "alternate"})
    for link in unparsed_links:
        link = link["href"]
        if "dofus" in link:
            all_links[link.split("/")[3]] = link

    all_soups["en"] = soup
    for key, value in all_links.items():
        # if key == "pt" or key == "it" or key == "es" or key == "de":
        #     continue
        soup = get_soup(value)
        all_soups[key] = soup

    return all_soups


def get_alternate_names(all_soups):
    names = {}
    for key, value in all_soups.items():
        name = value.find("h1", attrs={"class": "ak-return-link"}).text.strip()
        names[key] = name

    return names


def get_stats(all_soups):
    has_stats = False
    stats_soup = all_soups["en"].find_all("div", class_="ak-panel-title")
    for subsection in stats_soup:
        if "Effects" in subsection.text:
            has_stats = True

    if has_stats == False:
        return ([], [], [])

    raw_stats = all_soups["en"].find(
        "div", {"class": "ak-container ak-content-list ak-displaymode-col"}
    )
    stats = []
    custom_stats = {}
    damage_stats = []

    if raw_stats:
        i = 0
        for stat in raw_stats:
            description = stat.find_next("div", {"class": "ak-title"}).text.strip()

            # The dofus site does not distinguish special descriptive or custom
            # stats from normal combat stats. As such, discerning them from
            # normal stats is a bit difficult. For now, I'm simply using a
            # char count analysis to separate the 2. This will need testing
            # or refactoring at a later time
            if len(description) > 40:
                custom_stats = {
                    "en": [],
                    "fr": [],
                    "de": [],
                    "es": [],
                    "it": [],
                    "pt": [],
                }
                for key, value in all_soups.items():
                    custom_stat = (
                        value.find(
                            "div",
                            {
                                "class": "ak-container ak-content-list ak-displaymode-col"
                            },
                        )
                        .find_all("div", {"class": "ak-title"})[i]
                        .text.strip()
                    )
                    custom_stats[key].append(custom_stat)

                i = i + 1
                continue

            type = None
            min_stat = None
            max_stat = None

            if re.search(
                r"\d+ \((?:{})\)".format(Constants.all_weapon_effects), description
            ):
                # print("--------- Found a weapon effect ---------")
                if "to" in description:
                    arr = description.replace("(", "").strip(")").split(" ")
                    type = " ".join(arr[3:])
                    min_stat = int(arr[0])
                    max_stat = int(arr[2])
                else:
                    arr = description.replace("(", "").strip(")").split(" ")
                    type = " ".join(arr[1:])
                    max_stat = int(arr[0])

                damage_stats.append(
                    {"stat": type, "minStat": min_stat, "maxStat": max_stat,}
                )

                i = i + 1
                continue

            if re.search(r"(?:-\d to \d|-\d) (?:AP|MP)", description):
                # print("--------- Found a weapon effect ---------")
                if "to" in description:
                    arr = description.split(" ")
                    type = arr[3]
                    min_stat = int(arr[0])
                    if "-" in arr[2]:
                        max_stat = int(arr[2])
                    else:
                        max_stat = int("-" + arr[2])
                else:
                    arr = description.split(" ")
                    type = arr[1]
                    max_stat = int(arr[0])

                damage_stats.append(
                    {"stat": type, "minStat": min_stat, "maxStat": max_stat,}
                )

                i = i + 1
                continue

            if (
                re.search(
                    r"(\d+%?\s(?:{})$)|(?:^Reflects\s\d)".format(Constants.all_stats),
                    description,
                )
                == None
            ):
                if custom_stats == {}:
                    custom_stats = {
                        "en": [],
                        "fr": [],
                        "de": [],
                        "es": [],
                        "it": [],
                        "pt": [],
                    }
                for key, value in all_soups.items():
                    custom_stat = (
                        value.find(
                            "div",
                            {
                                "class": "ak-container ak-content-list ak-displaymode-col"
                            },
                        )
                        .find_all("div", {"class": "ak-title"})[i]
                        .text.strip()
                    )
                    custom_stats[key].append(custom_stat)

                i = i + 1
                continue

            # In all other cases, we create the stat as normal
            # check and adjust for the description typo that substitutes "HP"
            # for "Initiative"
            description = description.replace("HP", "Initiative")

            # check and adjust for the different types of stats
            if "Reflect" in description:
                arr = description.split(" ")
                type = "Reflect"
                minStat = int(arr[1])
                maxStat = int(arr[3])
            elif "to" in description and "-" not in description:
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

            stats.append(
                {"stat": type, "minStat": min_stat, "maxStat": max_stat,}
            )

            i = i + 1

    return (stats, custom_stats, damage_stats)


def get_bonuses(all_soups):
    all_bonuses = {}
    raw_bonuses = all_soups["en"].find_all("div", attrs={"class": "set-bonus-list"})
    for i in range(len(raw_bonuses)):
        stats = []
        bonuses = raw_bonuses[i].find_all("div", attrs={"class": "ak-title"})
        j = 0
        for bonus in bonuses:
            description = bonus.text.strip()
            type = None
            value = None
            alt_stat = None

            if (
                re.search(
                    r"(\d+%?\s(?:{})$)|(?:^Reflects\s\d)".format(Constants.all_stats),
                    description,
                )
                == None
            ):
                alt_stat = {"en": [], "fr": [], "de": [], "es": [], "it": [], "pt": []}
                for key, soup in all_soups.items():
                    custom_stat = (
                        soup.find_all("div", attrs={"class": "set-bonus-list"})[i]
                        .find_all("div", attrs={"class": "ak-title"})[j]
                        .text.strip()
                    )
                    alt_stat[key].append(custom_stat)

                stats.append(
                    {"stat": type, "value": value, "altStat": alt_stat,}
                )

                j = j + 1
                continue

            # In all other cases, we create the stat as normal
            # check and adjust for the description typo that substitutes "HP" for "Initiative"
            description = description.replace("HP", "Initiative")

            # check and adjust for values that have ranges and negative values
            if "to" in description and "-" not in description:
                arr = description.split(" ")
                max_stat = int(arr[2].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = " ".join(arr)
            elif "to" in description and "-" in description:
                arr = description.split(" ")
                max_stat = int(arr[0].replace("%", ""))
                del arr[0]
                del arr[0]
                del arr[0]
                type = " ".join(arr)
            elif "Reflect" in description:
                arr = description.split(" ")
                type = "Reflect"
                maxStat = int(arr[1])
            else:
                arr = description.split(" ")
                max_stat = int(arr[0].replace("%", ""))
                del arr[0]
                type = " ".join(arr)

            if "%" in description and "Critical" not in description:
                type = "% " + type

            stats.append({"stat": type, "value": max_stat, "altStat": alt_stat})

            j = j + 1

        item_count = 2 + i
        all_bonuses[item_count] = stats

    return all_bonuses


def get_pet_stats():
    headers = {
        "accept": "text/html, */*; q=0.01",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "content-length": "42",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "origin": "https://www.dofus.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
        "x-pjax": "true",
        "x-pjax-container": ".ak-item-details-container",
        "x-requested-with": "XMLHttpRequest",
    }
    data = {"level": "100", "_pjax": ".ak-item-details-container"}
    url = "https://www.dofus.com/en/mmorpg/encyclopedia/pets/12541"
    response = requests.post(url, data=data, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    return get_stats({"en": soup})


def get_conditions(all_soups, item_type):
    has_conditions = False
    conditions_soup = all_soups["en"].find_all("div", class_="ak-panel-title")
    for subsection in conditions_soup:
        if "Conditions" in subsection.text:
            has_conditions = True

    if has_conditions == False:
        return {"conditions": {}, "customConditions": {}}

    non_standard_conditions = ["months", "day(s)"]

    raw_conditions = None

    weapons = [
        "Axe",
        "Bow",
        "Dagger",
        "Hammer",
        "Pickaxe",
        "Scythe",
        "Shovel",
        "Staff",
        "Sword",
        "Tool",
        "Wand",
        "Soul stone",
    ]
    if item_type in weapons:
        raw_conditions = all_soups["en"].find_all(
            "div", attrs={"class": "ak-container ak-panel no-padding"}
        )[1]
    else:
        raw_conditions = all_soups["en"].find(
            "div", attrs={"class": "ak-container ak-panel no-padding"}
        )

    conditions = {}
    custom_conditions = {}

    if raw_conditions:
        raw_conditions = (
            raw_conditions.text.strip().strip("Conditions").strip().split("\n")
        )

        i = 0
        while i < len(raw_conditions):
            raw_conditions[i] = unicodedata.normalize("NFKD", raw_conditions[i]).strip()
            i = i + 1

        current_operator = None

        i = 0
        while i < len(raw_conditions):
            # logic for custom conditions
            if (
                re.search(
                    r"(?:^\()|(?:^\))|(?:(?:{}) (?:<|>) \d+)".format(
                        Constants.all_stats
                    ),
                    raw_conditions[i],
                )
                == None
            ):
                # condition = raw_conditions[i].strip(" and")
                # custom_conditions.append(condition)

                if custom_conditions == {}:
                    custom_conditions = {
                        "en": [],
                        "fr": [],
                        "de": [],
                        "es": [],
                        "it": [],
                        "pt": [],
                    }
                for key, value in all_soups.items():
                    custom_stat = None
                    if item_type in weapons:
                        custom_stat = (
                            value.find_all(
                                "div",
                                attrs={"class": "ak-container ak-panel no-padding"},
                            )[1]
                            .find("div", {"class": "ak-title"})
                            .text.strip()
                            .split("\n")
                        )[i]
                        custom_stat = unicodedata.normalize("NFKD", custom_stat).strip()
                    else:
                        custom_stat = (
                            value.find(
                                "div",
                                attrs={"class": "ak-container ak-panel no-padding"},
                            )
                            .find("div", {"class": "ak-title"})
                            .text.strip()
                            .split("\n")
                        )[i]
                        custom_stat = unicodedata.normalize("NFKD", custom_stat).strip()

                    custom_conditions[key].append(custom_stat)

                i = i + 1

            # logic for normal conditions
            else:
                # non-nested conditions
                if "(" not in raw_conditions[i]:
                    if "or" in raw_conditions[i]:
                        current_operator = "or"
                        if "or" in conditions.keys():
                            condition = raw_conditions[i].strip(" or").split(" ")
                            stat = condition[0]
                            operator = condition[1]
                            value = int(condition[2])

                            conditions["or"].append(
                                {"stat": stat, "operator": operator, "value": value,}
                            )
                        else:
                            condition = raw_conditions[i].strip(" or").split(" ")
                            stat = condition[0]
                            operator = condition[1]
                            value = int(condition[2])

                            conditions["or"] = [
                                {"stat": stat, "operator": operator, "value": value,}
                            ]
                    elif "and" in raw_conditions[i]:
                        current_operator = "and"
                        if "and" in conditions.keys():
                            condition = raw_conditions[i].strip(" and").split(" ")
                            stat = condition[0]
                            operator = condition[1]
                            value = int(condition[2])

                            conditions["and"].append(
                                {"stat": stat, "operator": operator, "value": value,}
                            )
                        else:
                            condition = raw_conditions[i].strip(" and").split(" ")
                            stat = condition[0]
                            operator = condition[1]
                            value = int(condition[2])

                            conditions["and"] = [
                                {"stat": stat, "operator": operator, "value": value,}
                            ]
                    else:
                        if current_operator:
                            condition = raw_conditions[i].split(" ")
                            stat = condition[0]
                            operator = condition[1]
                            value = int(condition[2])

                            conditions[current_operator].append(
                                {"stat": stat, "operator": operator, "value": value,}
                            )
                        else:
                            current_operator = "and"
                            if "and" in conditions.keys():
                                condition = raw_conditions[i].strip(" and").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                conditions["and"].append(
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                )
                            else:
                                condition = raw_conditions[i].strip(" and").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                conditions["and"] = [
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                ]

                    i = i + 1

                # nested conditions
                else:
                    # find how the nested condition relates to other conditions
                    logic_operator = None
                    if (i - 1) >= 0 and "and" in raw_conditions[i - 1]:
                        logic_operator = "and"
                    elif (i - 1) >= 0 and "or" in raw_conditions[i - 1]:
                        logic_operator = "or"
                    else:
                        j = i
                        while j < len(raw_conditions):
                            if ")" in raw_conditions[j] and "and" in raw_conditions[j]:
                                logic_operator = "and"
                                break
                            elif ")" in raw_conditions[j] and "or" in raw_conditions[j]:
                                logic_operator = "or"
                                break
                            else:
                                j = j + 1

                    # if no operator is found, default to "and"
                    if logic_operator == None:
                        logic_operator = "and"

                    # Add the nested conditions
                    nested_conditions = {}
                    inner_operator = None
                    i = i + 1
                    while i < len(raw_conditions) and all(
                        end not in raw_conditions[i] for end in [") and", ") or"]
                    ):
                        if ")" in raw_conditions[i] and "s)" not in raw_conditions[i]:
                            i = i + 1
                            continue

                        if any(
                            invalid in raw_conditions[i]
                            for invalid in non_standard_conditions
                        ):
                            # condition = raw_conditions[i]
                            # print(condition)
                            # custom_conditions.append(condition)

                            if custom_conditions == {}:
                                custom_conditions = {
                                    "en": [],
                                    "fr": [],
                                    "de": [],
                                    "es": [],
                                    "it": [],
                                    "pt": [],
                                }

                            for key, value in all_soups.items():
                                custom_stat = None
                                if item_type in weapons:
                                    custom_stat = (
                                        value.find_all(
                                            "div",
                                            attrs={
                                                "class": "ak-container ak-panel no-padding"
                                            },
                                        )[1]
                                        .text.strip()
                                        .split("\n")
                                    )[i]
                                    custom_stat = unicodedata.normalize(
                                        "NFKD", custom_stat
                                    ).strip()
                                else:
                                    custom_stat = (
                                        value.find(
                                            "div",
                                            {
                                                "class": "ak-container ak-panel no-padding"
                                            },
                                        )
                                        .find("div", {"class": "ak-title"})
                                        .text.strip()
                                        .split("\n")
                                    )[i]
                                    custom_stat = unicodedata.normalize(
                                        "NFKD", custom_stat
                                    ).strip()

                                custom_conditions[key].append(custom_stat)

                            i = i + 1
                            continue

                        if "or" in raw_conditions[i]:
                            inner_operator = "or"
                            if "or" in nested_conditions.keys():
                                condition = raw_conditions[i].strip(" or").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                nested_conditions["or"].append(
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                )
                            else:
                                condition = raw_conditions[i].strip(" or").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                nested_conditions["or"] = [
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                ]
                        elif "and" in raw_conditions[i]:
                            inner_operator = "and"
                            if "and" in nested_conditions.keys():
                                condition = raw_conditions[i].strip(" and").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                nested_conditions["and"].append(
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                )
                            else:
                                condition = raw_conditions[i].strip(" and").split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                nested_conditions["and"] = [
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                ]
                        else:
                            if inner_operator:
                                condition = raw_conditions[i].split(" ")
                                stat = condition[0]
                                operator = condition[1]
                                value = int(condition[2])

                                nested_conditions[inner_operator].append(
                                    {
                                        "stat": stat,
                                        "operator": operator,
                                        "value": value,
                                    }
                                )
                            else:
                                inner_operator = "and"
                                if "and" in nested_conditions.keys():
                                    condition = (
                                        raw_conditions[i].strip(" and").split(" ")
                                    )
                                    stat = condition[0]
                                    operator = condition[1]
                                    value = int(condition[2])

                                    nested_conditions["and"].append(
                                        {
                                            "stat": stat,
                                            "operator": operator,
                                            "value": value,
                                        }
                                    )
                                else:
                                    condition = (
                                        raw_conditions[i].strip(" and").split(" ")
                                    )
                                    stat = condition[0]
                                    operator = condition[1]
                                    value = int(condition[2])

                                    nested_conditions["and"] = [
                                        {
                                            "stat": stat,
                                            "operator": operator,
                                            "value": value,
                                        }
                                    ]

                        i = i + 1

                    if logic_operator in conditions.keys():
                        conditions[logic_operator].append(nested_conditions)
                    else:
                        conditions[logic_operator] = nested_conditions

                    i = i + 2

    all_conditions = {"conditions": conditions, "customConditions": custom_conditions}

    return all_conditions


def get_weapon_stats(soup):
    ap_cost = int(
        (
            soup.find("div", {"class": "ak-container ak-panel no-padding"})
            .find("span", {"class": "ak-title-info"})
            .text
        ).split(" ")[0]
    )
    uses_per_turn = int(
        (
            soup.find("div", {"class": "ak-container ak-panel no-padding"})
            .find("span", {"class": "ak-title-info"})
            .text
        )
        .replace("(", "")
        .replace(")", "")
        .split(" ")[1]
    )
    range = (
        soup.find("div", {"class": "ak-container ak-panel no-padding"})
        .find_all("div", {"class", "ak-list-element"})[1]
        .find("span", {"class": "ak-title-info"})
        .text
    )
    min_range = None
    max_range = None
    if "to" in range:
        arr = range.split(" ")
        min_range = int(arr[0])
        max_range = int(arr[2])
    else:
        max_range = int(range)

    crit_info = (
        soup.find("div", {"class": "ak-container ak-panel no-padding"})
        .find_all("div", {"class", "ak-list-element"})[2]
        .find("span", {"class": "ak-title-info"})
        .text
    )

    base_crit_chance = int(crit_info.split(" ")[0].split("/")[1])
    crit_bonus_damage = 0
    if len(crit_info.split(" ")) > 1:
        crit_bonus_damage = int(
            crit_info.split(" ")[1].replace("+", "").replace("(", "").replace(")", "")
        )

    weapon_stat = {
        "apCost": ap_cost,
        "usesPerTurn": uses_per_turn,
        "minRange": min_range,
        "maxRange": max_range,
        "baseCritChance": base_crit_chance,
        "critBonusDamage": crit_bonus_damage,
    }

    return weapon_stat
