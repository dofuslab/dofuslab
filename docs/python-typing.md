# Incremental Python typing

The backend uses mypy on Python 3.12. The initial baseline is deliberately
small: `server/mypy.ini` lists the application modules that must stay fully
annotated and type-clean. This does not claim that the rest of the backend is
typed.

Run the enforced check from `server/`:

```sh
python -m mypy
```

New typing slices should add coherent module boundaries to `files` in
`mypy.ini`, annotate every function in those modules, and add runtime tests
where annotations or import relationships could affect execution. Do not make
the baseline pass with broad `Any` annotations, blanket ignore settings, or
unchecked function bodies. Use narrow protocols or typed data structures when
a boundary cannot depend directly on a concrete implementation.

Typing work must preserve the synchronous request, database, and job model.
Adopting `async`/`await` requires separate architecture and dependency work and
is not part of the incremental typing baseline.

Importer and recommendation-trainer modules are deliberately deferred. Their
active changes live on separate branches, so they should be added to the mypy
baseline only after those branches are published and integrated without
copying or bypassing their review history. The four modules currently listed
in `mypy.ini` are incremental coverage, not a claim that the whole backend is
typed.
