from flask.ext import wtf
import wtforms
import flask
import auth
import model
import simplify
from main import app

simplify.public_key = ""
simplify.private_key = ""


class AddTransactionForm(wtf.Form):
    name = wtforms.StringField('Name', [wtforms.validators.required()])
    card = wtforms.StringField(
        'Card Number', [wtforms.validators.required(), ])
    phone = wtforms.StringField('Phone', [wtforms.validators.optional()])
    address = wtforms.TextAreaField('Address', [wtforms.validators.optional()])


@app.route('/transaction/create/', methods=['GET', 'POST'])
@auth.login_required
def transaction_create():
    form = AddTransactionForm()
    if form.validate_on_submit():
        transaction_db = model.transaction(
            user_key=auth.current_user_key(),
            name=form.name.data,
            email=form.email.data,
            phone=form.phone.data,
            address=form.address.data,
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
