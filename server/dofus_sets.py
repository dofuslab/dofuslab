from flask import Flask, escape, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_graphql import GraphQLView
from schema import schema

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres+psycopg2://postgres:password@localhost:5432/dofus_sets'
db = SQLAlchemy(app)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/create')
def create():
    return render_template('set_creation.html', title='Set')


app.add_url_rule(
    '/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)


if __name__ == '__main__':
    app.run(debug=True)
