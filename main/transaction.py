from flask.ext import wtf
import wtforms
import flask
import auth
import model
from main import app


class AddTransactionForm(wtf.Form):
    name = wtforms.StringField('Name', [wtforms.validators.required()])
    card = wtforms.StringField(
        'Card Number', [wtforms.validators.required()])
    month = wtforms.IntegerField(
        'Expiration Month', [wtforms.validators.required()])
    year = wtforms.IntegerField(
        'Expiration Year', [wtforms.validators.required()])
    cvc = wtforms.IntegerField('CVC', [wtforms.validators.required()])


@app.route('/transaction/create/', methods=['GET', 'POST'])
@auth.login_required
def transaction_create():
    form = AddTransactionForm()
    if form.validate_on_submit():
        transaction_db = model.transaction(
            user_key=auth.current_user_key(),

        )
        transaction_db.put()
        return flask.redirect(flask.url_for('welcome'))
    return flask.render_template(
        'transaction_create.html',
        html_class='transaction-create',
        title='Create Transaction',
        form=form,
    )


@app.route('/transaction')
def transaction_list():
    return flask.render_template('transaction.html', html_class='transaction')
