import sys

import os

from logging.config import fileConfig



from sqlalchemy import engine_from_config

from sqlalchemy import pool



from alembic import context



# --- CUSTOM CONFIGURATION START ---



# 1. Add the project root to the python path so imports work

# This allows Alembic to see 'app' as a package

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))



# 2. Import your application's settings and database Base

from app.config import settings

from app.database import Base

from app.models import * # noqa

# (Importing * from models ensures all SQLAlchemy models are registered

# with the Base metadata before migrations run)



# 3. Set the metadata object so Alembic can auto-generate migrations

target_metadata = Base.metadata



# --- CUSTOM CONFIGURATION END ---



config = context.config



# Interpret the config file for Python logging.

# This line sets up loggers basically.

if config.config_file_name is not None:

    fileConfig(config.config_file_name)



def run_migrations_offline() -> None:

    """Run migrations in 'offline' mode.



    This configures the context with just a URL

    and not an Engine, though an Engine is acceptable

    here as well.  By skipping the Engine creation

    we don't even need a DBAPI to be available.



    Calls to context.execute() here emit the given string to the

    script output.

    """

    # CLEAN CODE: Read URL from settings, not alembic.ini

    url = settings.database_url

    

    context.configure(

        url=url,

        target_metadata=target_metadata,

        literal_binds=True,

        dialect_opts={"paramstyle": "named"},

    )



    with context.begin_transaction():

        context.run_migrations()





def run_migrations_online() -> None:

    """Run migrations in 'online' mode.



    In this scenario we need to create an Engine

    and associate a connection with the context.

    """

    # CLEAN CODE: Inject the database URL from our settings into the config

    configuration = config.get_section(config.config_ini_section)

    configuration["sqlalchemy.url"] = settings.database_url



    connectable = engine_from_config(

        configuration,

        prefix="sqlalchemy.",

        poolclass=pool.NullPool,

    )



    with connectable.connect() as connection:

        context.configure(

            connection=connection, target_metadata=target_metadata

        )



        with context.begin_transaction():

            context.run_migrations()





if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()