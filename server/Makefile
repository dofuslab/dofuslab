freeze:
	pip freeze | grep -v "pkg-resources" > requirements.txt
publish-heroku:
	cd ../ && git subtree push --prefix server heroku-server master || true
