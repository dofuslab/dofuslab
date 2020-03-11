import requests
import re
from bs4 import BeautifulSoup

all_stats = [
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

joined_stats = "|".join(all_stats)


def get_soup(url):
    url_response = requests.get(url)
    soup = BeautifulSoup(url_response.text, "html.parser")
    return soup


def get_alternate_names(soup):
    alt_links = {}
    raw_links = soup.find("head").find_all("link", {"rel": "alternate"})
    for link in raw_links:
        link = link["href"]
        if "dofus" in link:
            alt_links[link.split("/")[3]] = link

    names = {}
    names["en"] = soup.find("h1", attrs={"class": "ak-return-link"}).text.strip()
    for key, value in alt_links.items():
        # temporarily using just fr
        if "fr" in key:
            alt_soup = get_soup(value)
            name = alt_soup.find("h1", attrs={"class": "ak-return-link"}).text.strip()
            names[key] = name

    return names


def get_stats(soup, id):
    has_stats = False
    stats_soup = soup.find_all("div", class_="ak-panel-title")
    for subsection in stats_soup:
        if "Effects" in subsection.text:
            has_stats = True

    if has_stats == False:
        # print("Item (id: {}) does not have stats".format(id))
        return ([], [])

    raw_stats = soup.find(
        "div", {"class": "ak-container ak-content-list ak-displaymode-col"}
    )
    stats = []
    custom_stats = []

    print(id)
    if raw_stats:
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

            if (
                re.search(
                    r"(\d+%?\s(?:{})$)|(?:^Reflects\s\d)".format(joined_stats),
                    description,
                )
                == None
            ):
                custom_stats.append(description)

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

    return (stats, custom_stats)


def get_bonuses(soup):
    all_bonuses = {}
    raw_bonuses = soup.find_all("div", attrs={"class": "set-bonus-list"})
    for i in range(len(raw_bonuses)):
        stats = []
        bonuses = raw_bonuses[i].find_all("div", attrs={"class": "ak-title"})
        for bonus in bonuses:
            description = bonus.text.strip()
            type = None
            value = None
            alt_stat = None

            # In cases we have non-traditional stats, we take the description raw
            # and place it under altStat
            n_stats = (
                "following",
                "Aura",
                "Title",
                "no longer requires",
                "on the spell",
                "linear",
                "Reduces",
                "Increases",
                "modifiable",
                "bonus",
                "speech",
                "temporary",
                "emote",
            )
            if any(x in description for x in n_stats):
                print(description)
                alt_stat = description

                stats.append(
                    {"stat": type, "value": value, "altStat": alt_stat,}
                )

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

        item_count = 2 + i
        all_bonuses[item_count] = stats

    return all_bonuses


def get_conditions(soup):
    non_standard_conditions_en = ["months", "day(s)"]
    non_standard_conditions_fr = []
    non_standard_conditions_de = []
    non_standard_conditions_es = []
    non_standard_conditions_it = []
    non_standard_conditions_pt = []

    all_non_standard_conditions = (
        non_standard_conditions_en
        + non_standard_conditions_fr
        + non_standard_conditions_de
        + non_standard_conditions_es
        + non_standard_conditions_it
        + non_standard_conditions_pt
    )

    raw_conditions = soup.find(
        "div", attrs={"class": "ak-container ak-panel no-padding"}
    )
    conditions = {}
    custom_conditions = []

    if raw_conditions:
        raw_conditions = (
            raw_conditions.text.strip().strip("Conditions").strip().split("\n")
        )

        current_operator = None

        i = 0
        while i < len(raw_conditions):
            # logic for custom conditions
            if (
                re.search(
                    r"(?:^\()|(?:^\))|(?:(?:{}) (?:<|>) \d+)".format(joined_stats),
                    raw_conditions[i],
                )
                == None
            ):
                condition = raw_conditions[i].strip(" and")
                print(condition)
                custom_conditions.append(condition)
                i = i + 1

            # logic for normal conditions
            else:
                # non-nested conditions
                if "(" not in raw_conditions[i]:
                    if "or" in raw_conditions[i]:
                        current_operator = "or"
                        if "or" in conditions.keys():
                            condition = raw_conditions[i].strip(" or").split(" ")
                            print(condition)
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
                    while ")" not in raw_conditions[i]:
                        if any(
                            invalid in raw_conditions[i]
                            for invalid in all_non_standard_conditions
                        ):
                            condition = (
                                raw_conditions[i].strip().strip(" and").strip(" or")
                            )
                            custom_conditions.append(condition)
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

    # if raw_conditions:
    #     raw_conditions = (
    #         raw_conditions.text.strip().strip("Conditions").strip().split("\n")
    #     )
    #     for unparsed_condition in raw_conditions:
    #         if "<" not in unparsed_condition and ">" not in unparsed_condition:
    #             condition = unparsed_condition.strip(" and")
    #             print(condition)
    #             custom_conditions.append(condition)
    #         elif "Alignment" in unparsed_condition or "Lvl" in unparsed_condition:
    #             condition = unparsed_condition.strip(" and")
    #             print(condition)
    #             custom_conditions.append(condition)
    #         else:
    #             condition = unparsed_condition.strip(" and").split(" ")
    #             stat_type = condition[0]
    #             condition_type = condition[1]
    #             limit = int(condition[2])
    #
    #             conditions.append(
    #                 {
    #                     "statType": stat_type,
    #                     "condition": condition_type,
    #                     "limit": limit,
    #                 }
    #             )

    all_conditions = {"conditions": conditions, "customConditions": custom_conditions}

    return all_conditions
