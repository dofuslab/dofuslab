from flask import Flask, escape, request, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/create')
def create():
    return render_template('set_creation.html', title='Set')

if __name__ == '__main__':
    app.run(debug=True)
