import json
import os

dirname = os.path.dirname(os.path.abspath(__file__))


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


if __name__ == "__main__":
    add_missing_trophy_conditions()
