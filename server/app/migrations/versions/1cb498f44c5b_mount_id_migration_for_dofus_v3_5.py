"""Mount ID migration for Dofus v3.5

Revision ID: 1cb498f44c5b
Revises: 3c596c660380
Create Date: 2026-04-08 08:02:48.938692

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1cb498f44c5b'
down_revision = '3c596c660380'
branch_labels = None
depends_on = None

# The mapping from our generated mount_map.json
# note: name is technically unneeded, but included for potential validation
MOUNT_MAP = [
    {"name": "Almond and Crimson Dragoturkey", "old_id": 41, "new_id": 33008},
    {"name": "Almond and Ebony Dragoturkey", "old_id": 34, "new_id": 33003},
    {"name": "Almond and Emerald Dragoturkey", "old_id": 35, "new_id": 33004},
    {"name": "Almond and Emerald Seemyool", "old_id": 162, "new_id": 33070},
    {"name": "Almond and Ginger Dragoturkey", "old_id": 38, "new_id": 33009},
    {"name": "Almond and Golden Dragoturkey", "old_id": 33, "new_id": 33002},
    {"name": "Almond and Indigo Dragoturkey", "old_id": 36, "new_id": 33005},
    {"name": "Almond and Ivory Dragoturkey", "old_id": 37, "new_id": 33006},
    {"name": "Almond and Ivory Seemyool", "old_id": 138, "new_id": 33071},
    {"name": "Almond and Orchid Dragoturkey", "old_id": 40, "new_id": 33007},
    {"name": "Almond and Turquoise Dragoturkey", "old_id": 39, "new_id": 33010},
    {"name": "Almond Dragoturkey", "old_id": 20, "new_id": 33001},
    {"name": "Almond Seemyool", "old_id": 96, "new_id": 33069},
    {"name": "Armoured Dragoturkey", "old_id": 88, "new_id": 33035},
    {"name": "Crimson and Almond Seemyool", "old_id": 117, "new_id": 33102},
    {"name": "Crimson and Emerald Seemyool", "old_id": 156, "new_id": 33103},
    {"name": "Crimson and Ginger Dragoturkey", "old_id": 71, "new_id": 33051},
    {"name": "Crimson and Ivory Seemyool", "old_id": 122, "new_id": 33104},
    {"name": "Crimson Dragoturkey", "old_id": 19, "new_id": 33050},
    {"name": "Crimson Seemyool", "old_id": 93, "new_id": 33101},
    {"name": "Ebony and Almond Seemyool", "old_id": 120, "new_id": 33081},
    {"name": "Ebony and Crimson Dragoturkey", "old_id": 54, "new_id": 33025},
    {"name": "Ebony and Crimson Seemyool", "old_id": 103, "new_id": 33086},
    {"name": "Ebony and Emerald Dragoturkey", "old_id": 50, "new_id": 33021},
    {"name": "Ebony and Emerald Seemyool", "old_id": 159, "new_id": 33082},
    {"name": "Ebony and Ginger Dragoturkey", "old_id": 12, "new_id": 33026},
    {"name": "Ebony and Indigo Dragoturkey", "old_id": 51, "new_id": 33022},
    {"name": "Ebony and Indigo Seemyool", "old_id": 109, "new_id": 33083},
    {"name": "Ebony and Ivory Dragoturkey", "old_id": 9, "new_id": 33023},
    {"name": "Ebony and Ivory Seemyool", "old_id": 125, "new_id": 33084},
    {"name": "Ebony and Orchid Dragoturkey", "old_id": 53, "new_id": 33024},
    {"name": "Ebony and Orchid Seemyool", "old_id": 107, "new_id": 33085},
    {"name": "Ebony and Turquoise Dragoturkey", "old_id": 52, "new_id": 33027},
    {"name": "Ebony Dragoturkey", "old_id": 3, "new_id": 33020},
    {"name": "Ebony Seemyool", "old_id": 91, "new_id": 33080},
    {"name": "Emerald and Crimson Dragoturkey", "old_id": 60, "new_id": 33032},
    {"name": "Emerald and Ginger Dragoturkey", "old_id": 57, "new_id": 33033},
    {"name": "Emerald and Indigo Dragoturkey", "old_id": 55, "new_id": 33029},
    {"name": "Emerald and Ivory Dragoturkey", "old_id": 56, "new_id": 33030},
    {"name": "Emerald and Orchid Dragoturkey", "old_id": 59, "new_id": 33031},
    {"name": "Emerald and Turquoise Dragoturkey", "old_id": 58, "new_id": 33034},
    {"name": "Emerald Dragoturkey", "old_id": 21, "new_id": 33028},
    {"name": "Emerald Seemyool", "old_id": 100, "new_id": 33087},
    {"name": "Feathered Dragoturkey", "old_id": 89, "new_id": 33000},
    {"name": "Ginger and Almond Seemyool", "old_id": 116, "new_id": 33117},
    {"name": "Ginger and Crimson Seemyool", "old_id": 111, "new_id": 33124},
    {"name": "Ginger and Ebony Seemyool", "old_id": 114, "new_id": 33119},
    {"name": "Ginger and Emerald Seemyool", "old_id": 161, "new_id": 33120},
    {"name": "Ginger and Golden Seemyool", "old_id": 115, "new_id": 33118},
    {"name": "Ginger and Indigo Seemyool", "old_id": 113, "new_id": 33121},
    {"name": "Ginger and Ivory Seemyool", "old_id": 127, "new_id": 33122},
    {"name": "Ginger and Orchid Seemyool", "old_id": 112, "new_id": 33123},
    {"name": "Ginger Dragoturkey", "old_id": 10, "new_id": 33063},
    {"name": "Ginger Seemyool", "old_id": 95, "new_id": 33116},
    {"name": "Golden and Almond Seemyool", "old_id": 121, "new_id": 33073},
    {"name": "Golden and Crimson Dragoturkey", "old_id": 49, "new_id": 33017},
    {"name": "Golden and Crimson Seemyool", "old_id": 101, "new_id": 33079},
    {"name": "Golden and Ebony Dragoturkey", "old_id": 42, "new_id": 33012},
    {"name": "Golden and Ebony Seemyool", "old_id": 110, "new_id": 33074},
    {"name": "Golden and Emerald Dragoturkey", "old_id": 43, "new_id": 33013},
    {"name": "Golden and Emerald Seemyool", "old_id": 160, "new_id": 33075},
    {"name": "Golden and Ginger Dragoturkey", "old_id": 46, "new_id": 33018},
    {"name": "Golden and Indigo Dragoturkey", "old_id": 44, "new_id": 33014},
    {"name": "Golden and Indigo Seemyool", "old_id": 108, "new_id": 33076},
    {"name": "Golden and Ivory Dragoturkey", "old_id": 45, "new_id": 33015},
    {"name": "Golden and Ivory Seemyool", "old_id": 126, "new_id": 33077},
    {"name": "Golden and Orchid Dragoturkey", "old_id": 48, "new_id": 33016},
    {"name": "Golden and Orchid Seemyool", "old_id": 105, "new_id": 33078},
    {"name": "Golden and Turquoise Dragoturkey", "old_id": 47, "new_id": 33019},
    {"name": "Golden Dragoturkey", "old_id": 18, "new_id": 33011},
    {"name": "Golden Seemyool", "old_id": 94, "new_id": 33072},
    {"name": "Indigo and Almond Seemyool", "old_id": 119, "new_id": 33089},
    {"name": "Indigo and Crimson Dragoturkey", "old_id": 65, "new_id": 33039},
    {"name": "Indigo and Crimson Seemyool", "old_id": 102, "new_id": 33093},
    {"name": "Indigo and Emerald Seemyool", "old_id": 158, "new_id": 33090},
    {"name": "Indigo and Ginger Dragoturkey", "old_id": 62, "new_id": 33040},
    {"name": "Indigo and Ivory Dragoturkey", "old_id": 61, "new_id": 33037},
    {"name": "Indigo and Ivory Seemyool", "old_id": 124, "new_id": 33091},
    {"name": "Indigo and Orchid Dragoturkey", "old_id": 64, "new_id": 33038},
    {"name": "Indigo and Orchid Seemyool", "old_id": 106, "new_id": 33092},
    {"name": "Indigo and Turquoise Dragoturkey", "old_id": 63, "new_id": 33041},
    {"name": "Indigo Dragoturkey", "old_id": 17, "new_id": 33036},
    {"name": "Indigo Seemyool", "old_id": 92, "new_id": 33088},
    {"name": "Ivory and Crimson Dragoturkey", "old_id": 68, "new_id": 33044},
    {"name": "Ivory and Emerald Seemyool", "old_id": 163, "new_id": 33095},
    {"name": "Ivory and Ginger Dragoturkey", "old_id": 11, "new_id": 33045},
    {"name": "Ivory and Orchid Dragoturkey", "old_id": 67, "new_id": 33043},
    {"name": "Ivory and Turquoise Dragoturkey", "old_id": 66, "new_id": 33046},
    {"name": "Ivory Dragoturkey", "old_id": 16, "new_id": 33042},
    {"name": "Ivory Seemyool", "old_id": 97, "new_id": 33094},
    {"name": "Orchid and Almond Seemyool", "old_id": 118, "new_id": 33097},
    {"name": "Orchid and Crimson Dragoturkey", "old_id": 76, "new_id": 33048},
    {"name": "Orchid and Crimson Seemyool", "old_id": 104, "new_id": 33100},
    {"name": "Orchid and Emerald Seemyool", "old_id": 157, "new_id": 33098},
    {"name": "Orchid and Ginger Dragoturkey", "old_id": 70, "new_id": 33049},
    {"name": "Orchid and Ivory Seemyool", "old_id": 123, "new_id": 33099},
    {"name": "Orchid Dragoturkey", "old_id": 22, "new_id": 33047},
    {"name": "Orchid Seemyool", "old_id": 90, "new_id": 33096},
    {"name": "Plum and Almond Dragoturkey", "old_id": 77, "new_id": 33053},
    {"name": "Plum and Almond Seemyool", "old_id": 152, "new_id": 33106},
    {"name": "Plum and Crimson Dragoturkey", "old_id": 87, "new_id": 33060},
    {"name": "Plum and Crimson Seemyool", "old_id": 146, "new_id": 33113},
    {"name": "Plum and Ebony Dragoturkey", "old_id": 79, "new_id": 33055},
    {"name": "Plum and Ebony Seemyool", "old_id": 149, "new_id": 33108},
    {"name": "Plum and Emerald Dragoturkey", "old_id": 80, "new_id": 33056},
    {"name": "Plum and Emerald Seemyool", "old_id": 155, "new_id": 33109},
    {"name": "Plum and Ginger Dragoturkey", "old_id": 84, "new_id": 33061},
    {"name": "Plum and Ginger Seemyool", "old_id": 151, "new_id": 33114},
    {"name": "Plum and Golden Dragoturkey", "old_id": 78, "new_id": 33054},
    {"name": "Plum and Golden Seemyool", "old_id": 150, "new_id": 33107},
    {"name": "Plum and Indigo Dragoturkey", "old_id": 82, "new_id": 33057},
    {"name": "Plum and Indigo Seemyool", "old_id": 148, "new_id": 33110},
    {"name": "Plum and Ivory Dragoturkey", "old_id": 83, "new_id": 33058},
    {"name": "Plum and Ivory Seemyool", "old_id": 153, "new_id": 33111},
    {"name": "Plum and Orchid Dragoturkey", "old_id": 86, "new_id": 33059},
    {"name": "Plum and Orchid Seemyool", "old_id": 147, "new_id": 33112},
    {"name": "Plum and Turquoise Dragoturkey", "old_id": 85, "new_id": 33062},
    {"name": "Plum and Turquoise Seemyool", "old_id": 154, "new_id": 33115},
    {"name": "Plum Dragoturkey", "old_id": 23, "new_id": 33052},
    {"name": "Plum Seemyool", "old_id": 99, "new_id": 33105},
    {"name": "Turquoise and Almond Seemyool", "old_id": 144, "new_id": 33126},
    {"name": "Turquoise and Crimson Dragoturkey", "old_id": 73, "new_id": 33067},
    {"name": "Turquoise and Crimson Seemyool", "old_id": 140, "new_id": 33133},
    {"name": "Turquoise and Ebony Seemyool", "old_id": 142, "new_id": 33128},
    {"name": "Turquoise and Emerald Seemyool", "old_id": 164, "new_id": 33129},
    {"name": "Turquoise and Ginger Dragoturkey", "old_id": 69, "new_id": 33068},
    {"name": "Turquoise and Ginger Seemyool", "old_id": 143, "new_id": 33134},
    {"name": "Turquoise and Golden Seemyool", "old_id": 145, "new_id": 33127},
    {"name": "Turquoise and Indigo Seemyool", "old_id": 141, "new_id": 33130},
    {"name": "Turquoise and Ivory Seemyool", "old_id": 139, "new_id": 33131},
    {"name": "Turquoise and Orchid Dragoturkey", "old_id": 72, "new_id": 33066},
    {"name": "Turquoise and Orchid Seemyool", "old_id": 165, "new_id": 33132},
    {"name": "Turquoise Dragoturkey", "old_id": 15, "new_id": 33065},
    {"name": "Turquoise Seemyool", "old_id": 98, "new_id": 33125},
    {"name": "Almond and Crimson Rhineetle", "old_id": 197, "new_id": 33140},
    {"name": "Almond and Ebony Rhineetle", "old_id": 200, "new_id": 33136},
    {"name": "Almond and Ginger Rhineetle", "old_id": 201, "new_id": 33141},
    {"name": "Almond and Indigo Rhineetle", "old_id": 199, "new_id": 33137},
    {"name": "Almond and Ivory Rhineetle", "old_id": 202, "new_id": 33138},
    {"name": "Almond and Orchid Rhineetle", "old_id": 198, "new_id": 33139},
    {"name": "Almond and Turquoise Rhineetle", "old_id": 203, "new_id": 33142},
    {"name": "Almond Rhineetle", "old_id": 181, "new_id": 33135},
    {"name": "Amethyst and Almond Rhineetle", "old_id": 280, "new_id": 33144},
    {"name": "Amethyst and Crimson Rhineetle", "old_id": 276, "new_id": 33151},
    {"name": "Amethyst and Ebony Rhineetle", "old_id": 279, "new_id": 33146},
    {"name": "Amethyst and Emerald Rhineetle", "old_id": 285, "new_id": 33147},
    {"name": "Amethyst and Ginger Rhineetle", "old_id": 281, "new_id": 33153},
    {"name": "Amethyst and Golden Rhineetle", "old_id": 286, "new_id": 33145},
    {"name": "Amethyst and Indigo Rhineetle", "old_id": 278, "new_id": 33148},
    {"name": "Amethyst and Ivory Rhineetle", "old_id": 282, "new_id": 33149},
    {"name": "Amethyst and Orchid Rhineetle", "old_id": 277, "new_id": 33150},
    {"name": "Amethyst and Plum Rhineetle", "old_id": 284, "new_id": 33152},
    {"name": "Amethyst and Turquoise Rhineetle", "old_id": 283, "new_id": 33154},
    {"name": "Amethyst Rhineetle", "old_id": 190, "new_id": 33143},
    {"name": "Crimson and Ebony Rhineetle", "old_id": 193, "new_id": 33203},
    {"name": "Crimson and Indigo Rhineetle", "old_id": 192, "new_id": 33204},
    {"name": "Crimson and Orchid Rhineetle", "old_id": 191, "new_id": 33205},
    {"name": "Crimson Rhineetle", "old_id": 178, "new_id": 33202},
    {"name": "Ebony Rhineetle", "old_id": 177, "new_id": 33166},
    {"name": "Emerald and Almond Rhineetle", "old_id": 230, "new_id": 33168},
    {"name": "Emerald and Crimson Rhineetle", "old_id": 226, "new_id": 33173},
    {"name": "Emerald and Ebony Rhineetle", "old_id": 229, "new_id": 33169},
    {"name": "Emerald and Ginger Rhineetle", "old_id": 231, "new_id": 33174},
    {"name": "Emerald and Indigo Rhineetle", "old_id": 228, "new_id": 33170},
    {"name": "Emerald and Ivory Rhineetle", "old_id": 233, "new_id": 33171},
    {"name": "Emerald and Orchid Rhineetle", "old_id": 227, "new_id": 33172},
    {"name": "Emerald and Turquoise Rhineetle", "old_id": 234, "new_id": 33175},
    {"name": "Emerald Rhineetle", "old_id": 185, "new_id": 33167},
    {"name": "Ginger and Crimson Rhineetle", "old_id": 204, "new_id": 33221},
    {"name": "Ginger and Ebony Rhineetle", "old_id": 207, "new_id": 33217},
    {"name": "Ginger and Indigo Rhineetle", "old_id": 206, "new_id": 33218},
    {"name": "Ginger and Ivory Rhineetle", "old_id": 208, "new_id": 33219},
    {"name": "Ginger and Orchid Rhineetle", "old_id": 205, "new_id": 33220},
    {"name": "Ginger and Turquoise Rhineetle", "old_id": 209, "new_id": 33222},
    {"name": "Ginger Rhineetle", "old_id": 180, "new_id": 33216},
    {"name": "Golden and Almond Rhineetle", "old_id": 292, "new_id": 33156},
    {"name": "Golden and Crimson Rhineetle", "old_id": 235, "new_id": 33162},
    {"name": "Golden and Ebony Rhineetle", "old_id": 238, "new_id": 33157},
    {"name": "Golden and Emerald Rhineetle", "old_id": 296, "new_id": 33158},
    {"name": "Golden and Ginger Rhineetle", "old_id": 291, "new_id": 33164},
    {"name": "Golden and Indigo Rhineetle", "old_id": 237, "new_id": 33159},
    {"name": "Golden and Ivory Rhineetle", "old_id": 293, "new_id": 33160},
    {"name": "Golden and Orchid Rhineetle", "old_id": 236, "new_id": 33161},
    {"name": "Golden and Plum Rhineetle", "old_id": 295, "new_id": 33163},
    {"name": "Golden and Turquoise Rhineetle", "old_id": 294, "new_id": 33165},
    {"name": "Golden Rhineetle", "old_id": 186, "new_id": 33155},
    {"name": "Indigo and Ebony Rhineetle", "old_id": 196, "new_id": 33177},
    {"name": "Indigo Rhineetle", "old_id": 176, "new_id": 33176},
    {"name": "Ivory and Crimson Rhineetle", "old_id": 210, "new_id": 33182},
    {"name": "Ivory and Ebony Rhineetle", "old_id": 213, "new_id": 33179},
    {"name": "Ivory and Indigo Rhineetle", "old_id": 212, "new_id": 33180},
    {"name": "Ivory and Orchid Rhineetle", "old_id": 211, "new_id": 33181},
    {"name": "Ivory and Turquoise Rhineetle", "old_id": 214, "new_id": 33183},
    {"name": "Ivory Rhineetle", "old_id": 182, "new_id": 33178},
    {"name": "Jade and Almond Rhineetle", "old_id": 243, "new_id": 33185},
    {"name": "Jade and Amethyst Rhineetle", "old_id": 252, "new_id": 33186},
    {"name": "Jade and Crimson Rhineetle", "old_id": 239, "new_id": 33193},
    {"name": "Jade and Ebony Rhineetle", "old_id": 242, "new_id": 33188},
    {"name": "Jade and Emerald Rhineetle", "old_id": 248, "new_id": 33189},
    {"name": "Jade and Ginger Rhineetle", "old_id": 244, "new_id": 33195},
    {"name": "Jade and Golden Rhineetle", "old_id": 249, "new_id": 33187},
    {"name": "Jade and Indigo Rhineetle", "old_id": 241, "new_id": 33190},
    {"name": "Jade and Ivory Rhineetle", "old_id": 245, "new_id": 33191},
    {"name": "Jade and Orchid Rhineetle", "old_id": 240, "new_id": 33192},
    {"name": "Jade and Plum Rhineetle", "old_id": 247, "new_id": 33194},
    {"name": "Jade and Ruby Rhineetle", "old_id": 250, "new_id": 33196},
    {"name": "Jade and Sapphire Rhineetle", "old_id": 251, "new_id": 33197},
    {"name": "Jade and Turquoise Rhineetle", "old_id": 246, "new_id": 33198},
    {"name": "Jade Rhineetle", "old_id": 187, "new_id": 33184},
    {"name": "Orchid and Ebony Rhineetle", "old_id": 195, "new_id": 33200},
    {"name": "Orchid and Indigo Rhineetle", "old_id": 194, "new_id": 33201},
    {"name": "Orchid Rhineetle", "old_id": 179, "new_id": 33199},
    {"name": "Plum and Almond Rhineetle", "old_id": 223, "new_id": 33207},
    {"name": "Plum and Crimson Rhineetle", "old_id": 219, "new_id": 33213},
    {"name": "Plum and Ebony Rhineetle", "old_id": 222, "new_id": 33208},
    {"name": "Plum and Emerald Rhineetle", "old_id": 225, "new_id": 33209},
    {"name": "Plum and Ginger Rhineetle", "old_id": 287, "new_id": 33214},
    {"name": "Plum and Indigo Rhineetle", "old_id": 221, "new_id": 33210},
    {"name": "Plum and Ivory Rhineetle", "old_id": 288, "new_id": 33211},
    {"name": "Plum and Orchid Rhineetle", "old_id": 220, "new_id": 33212},
    {"name": "Plum and Turquoise Rhineetle", "old_id": 224, "new_id": 33215},
    {"name": "Plum Rhineetle", "old_id": 184, "new_id": 33206},
    {"name": "Ruby and Almond Rhineetle", "old_id": 257, "new_id": 33224},
    {"name": "Ruby and Amethyst Rhineetle", "old_id": 290, "new_id": 33225},
    {"name": "Ruby and Crimson Rhineetle", "old_id": 253, "new_id": 33232},
    {"name": "Ruby and Ebony Rhineetle", "old_id": 256, "new_id": 33227},
    {"name": "Ruby and Emerald Rhineetle", "old_id": 262, "new_id": 33228},
    {"name": "Ruby and Ginger Rhineetle", "old_id": 258, "new_id": 33234},
    {"name": "Ruby and Golden Rhineetle", "old_id": 263, "new_id": 33226},
    {"name": "Ruby and Indigo Rhineetle", "old_id": 255, "new_id": 33229},
    {"name": "Ruby and Ivory Rhineetle", "old_id": 259, "new_id": 33230},
    {"name": "Ruby and Orchid Rhineetle", "old_id": 254, "new_id": 33231},
    {"name": "Ruby and Plum Rhineetle", "old_id": 261, "new_id": 33233},
    {"name": "Ruby and Sapphire Rhineetle", "old_id": 289, "new_id": 33235},
    {"name": "Ruby and Turquoise Rhineetle", "old_id": 260, "new_id": 33236},
    {"name": "Ruby Rhineetle", "old_id": 188, "new_id": 33223},
    {"name": "Sapphire and Almond Rhineetle", "old_id": 268, "new_id": 33238},
    {"name": "Sapphire and Amethyst Rhineetle", "old_id": 275, "new_id": 33239},
    {"name": "Sapphire and Crimson Rhineetle", "old_id": 264, "new_id": 33246},
    {"name": "Sapphire and Ginger Rhineetle", "old_id": 269, "new_id": 33248},
    {"name": "Sapphire and Golden Rhineetle", "old_id": 274, "new_id": 33240},
    {"name": "Sapphire and Indigo Rhineetle", "old_id": 266, "new_id": 33243},
    {"name": "Sapphire and Ivory Rhineetle", "old_id": 270, "new_id": 33244},
    {"name": "Sapphire and Plum Rhineetle", "old_id": 272, "new_id": 33247},
    {"name": "Sapphire and Turquoise Rhineetle", "old_id": 271, "new_id": 33249},
    {"name": "Sapphire Rhineetle", "old_id": 189, "new_id": 33237},
    {"name": "Turquoise and Crimson Rhineetle", "old_id": 215, "new_id": 33254},
    {"name": "Turquoise and Ebony Rhineetle", "old_id": 218, "new_id": 33251},
    {"name": "Turquoise and Indigo Rhineetle", "old_id": 217, "new_id": 33252},
    {"name": "Turquoise and Orchid Rhineetle", "old_id": 216, "new_id": 33253},
    {"name": "Turquoise Rhineetle", "old_id": 183, "new_id": 33250},
]


def get_new_id(id: int):
    for entry in MOUNT_MAP:
        if entry["old_id"] == id:
            return entry["new_id"]


def get_old_id(id: int):
    for entry in MOUNT_MAP:
        if entry["new_id"] == id:
            return entry["old_id"]


def upgrade():
    # Get all mounts:
    conn = op.get_bind()
    res = conn.execute(
        "SELECT item_type_translation.item_type_id, item.* "
        "FROM item "
        "JOIN item_type_translation ON item.item_type_id = item_type_translation.item_type_id "
        "WHERE item_type_translation.locale = 'en' "
        "AND item_type_translation.name = 'Mount';"
    )
    mounts = res.fetchall()

    # update mount IDs:
    for mount in mounts:
        new_id = get_new_id(mount.dofus_db_mount_id)
        assert new_id is not None

        conn.execute(
            "UPDATE item "
            "SET dofus_db_mount_id = '{}'"
            "WHERE dofus_db_mount_id = '{}' AND item_type_id = '{}';".format(
                new_id,
                mount.dofus_db_mount_id,
                mount.item_type_id,
            )
        )


def downgrade():
    # Get all mounts:
    conn = op.get_bind()
    res = conn.execute(
        "SELECT item_type_translation.item_type_id, item.* "
        "FROM item "
        "JOIN item_type_translation ON item.item_type_id = item_type_translation.item_type_id "
        "WHERE item_type_translation.locale = 'en' "
        "AND item_type_translation.name = 'Mount';"
    )
    mounts = res.fetchall()

    # update mount IDs:
    for mount in mounts:
        old_id = get_old_id(mount.dofus_db_mount_id)
        assert old_id is not None

        conn.execute(
            "UPDATE item "
            "SET dofus_db_mount_id = '{}'"
            "WHERE dofus_db_mount_id = '{}' AND item_type_id = '{}';".format(
                old_id,
                mount.dofus_db_mount_id,
                mount.item_type_id,
            )
        )
