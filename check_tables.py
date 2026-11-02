from API import db, Usuario

print("Tables:", list(db.Model.metadata.tables.keys()))
u = Usuario.__table__
print("Usuarios columns:", [c.name for c in u.columns])
print("SUCCESS: Tables exist!")