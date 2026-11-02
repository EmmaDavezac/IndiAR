import os
os.environ['MYSQL_USER'] = 'user'
os.environ['MYSQL_PASSWORD'] = 'password'
os.environ['MYSQL_HOST'] = 'db'
os.environ['MYSQL_DB'] = 'indiar'

from sqlalchemy import create_engine
from API import db, Usuario

engine = create_engine('mysql+mysqlconnector://user:password@db/indiar')
db.metadata.create_all(engine)
print('Tables created successfully!')