# Python FastAPI

Prefills for the questions a stack can answer on the user's behalf. Everything
here is a starting point the user can edit or delete.

To add a stack, copy this file, change the heading, change the text under each
section, and list it in templates/index.ts. Nothing else.

## what

Python and FastAPI, async throughout. SQLAlchemy for data access, Pydantic for
request and response models.

## commands

uvicorn app.main:app --reload
pytest
ruff check .
mypy app

## style

Type hints on every function signature, including return types.
Pydantic models for anything crossing the API boundary, never bare dicts.
Route handlers stay thin: validate, call a service, return. No business logic
in the handler.
Snake case everywhere. Ruff decides formatting, so do not argue with it.
