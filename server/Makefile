freeze:
	pip freeze | grep -v "pkg-resources" > requirements.txt
publish-heroku:
	cd ../ && git subtree push --prefix server heroku-server master || true
update-translations:
	pybabel extract -F babel.cfg -k _l -o messages.pot . && pybabel update -i messages.pot -d app/translations
compile-translations:
	pybabel compile -d app/translations
