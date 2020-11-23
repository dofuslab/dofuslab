from app.database.enums import GameVersion


def prompt_game_version():
    game_version = None
    while game_version == None:
        gamever_string = input("Select game version (2/Retro/Touch): ")
        if gamever_string.lower() == "retro":
            game_version = GameVersion.DOFUS_RETRO
        elif gamever_string.lower() == "touch":
            game_version = GameVersion.DOFUS_TOUCH
        elif gamever_string == "2":
            game_version = GameVersion.DOFUS_2
    return game_version


def get_relative_path_for_game_version(game_version):
    unformatted_str = "app/database/data/{}"
    if game_version == GameVersion.DOFUS_2:
        return unformatted_str.format("dofus2")
    if game_version == GameVersion.DOFUS_RETRO:
        return unformatted_str.format("retro")
    if game_version == GameVersion.DOFUS_TOUCH:
        return unformatted_str.format("touch")
    raise ValueError("{} is not a valid game version".format(game_version))
