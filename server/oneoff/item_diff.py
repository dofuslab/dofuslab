"""Pure semantic diff helpers used by item preview and apply."""

from collections import defaultdict, deque


def desired_stat_descriptors(record):
    descriptors = []
    for order, stat in enumerate(record.get("stats", [])):
        descriptors.append(
            {
                "kind": "stat",
                "stat": stat["stat"],
                "min": stat.get("minStat"),
                "max": stat.get("maxStat"),
                "order": order,
            }
        )

    custom_stats = record.get("customStats") or {}
    locales = sorted(custom_stats)
    lengths = {len(custom_stats[locale]) for locale in locales}
    if len(lengths) > 1:
        raise ValueError("Custom stat locale lists must have equal lengths")
    count = next(iter(lengths), 0)
    for index in range(count):
        descriptors.append(
            {
                "kind": "custom",
                "translations": tuple(
                    (locale, custom_stats[locale][index]) for locale in locales
                ),
                "order": len(record.get("stats", [])) + index,
            }
        )
    return descriptors


def stat_identity(descriptor):
    if descriptor["kind"] == "stat":
        return "stat", descriptor["stat"]
    return "custom", tuple(descriptor["translations"])


def diff_stat_descriptors(existing, desired):
    """Match identical logical stats and report exact field/order changes."""
    buckets = defaultdict(deque)
    for index, descriptor in enumerate(existing):
        buckets[stat_identity(descriptor)].append(index)

    matched_existing = set()
    matches = []
    creates = []
    updates = []
    for desired_index, desired_descriptor in enumerate(desired):
        candidates = buckets[stat_identity(desired_descriptor)]
        if not candidates:
            creates.append(desired_index)
            continue
        existing_index = candidates.popleft()
        matched_existing.add(existing_index)
        matches.append((existing_index, desired_index))
        existing_descriptor = existing[existing_index]
        comparable_fields = ("min", "max", "order")
        changed_fields = [
            field
            for field in comparable_fields
            if existing_descriptor.get(field) != desired_descriptor.get(field)
        ]
        if changed_fields:
            updates.append((existing_index, desired_index, changed_fields))

    deletes = [index for index in range(len(existing)) if index not in matched_existing]
    return {
        "matches": matches,
        "creates": creates,
        "updates": updates,
        "deletes": deletes,
    }


def project_stat_diff(existing, desired, diff):
    """Purely project a diff; useful for asserting preview/apply agreement."""
    projected = [dict(descriptor) for descriptor in existing]
    for existing_index, desired_index, _ in diff["updates"]:
        projected[existing_index] = dict(desired[desired_index])
    for existing_index in sorted(diff["deletes"], reverse=True):
        del projected[existing_index]
    projected.extend(dict(desired[index]) for index in diff["creates"])
    return sorted(projected, key=lambda descriptor: descriptor["order"])
