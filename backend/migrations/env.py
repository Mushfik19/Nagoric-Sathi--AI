from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.models import Base

import os
from dotenv import load_dotenv

load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Override sqlalchemy.url with DATABASE_URL from environment
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Alembic runs synchronously, so we must replace asyncpg with psycopg2 or asyncpg with async driver setup.
    # Since we are just running generation, wait, the user's url will have postgresql+asyncpg.
    # SQLAlchemy requires an async engine for asyncpg, but alembic default template is sync.
    # Wait, alembic 1.13 supports async if we use the async template, but we used the default sync template.
    # If the URL is asyncpg, we must replace it with psycopg2 for standard alembic sync, OR we must run async alembic.
    # Let's just use the URL as is. If it's asyncpg, alembic might fail unless we use the async env.py template.
    # Actually, we can just replace '+asyncpg' with '' to use psycopg2 (which is default) or psycopg.
    # Let's install psycopg2-binary so alembic can connect synchronously.
    sync_url = db_url.replace("+asyncpg", "").replace("+aiosqlite", "")
    config.set_main_option("sqlalchemy.url", sync_url)


# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata


# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
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
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
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
