from google.appengine.ext import ndb
import model


class Transaction(model.Base):
    user_key = ndb.KeyProperty(kind=model.User, required=True)
    # amount in cents (no currency type)
    amount = ndb.IntegerProperty(required=True)
    location = ndb.GeoPtProperty(required=True)
    timestamp = ndb.DateTimeProperty(required=True, auto_now_add=True)
