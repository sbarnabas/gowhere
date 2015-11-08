from google.appengine.ext import ndb
import model


class Transaction(model.Base):
    user_key = ndb.KeyProperty(kind=model.User, required=True)
