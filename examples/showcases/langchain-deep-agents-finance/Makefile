.PHONY: dev agent seed test install

install:
	cd . && npm install
	cd agent && pip install -e ".[dev]"

dev:
	npx prisma generate
	npx prisma db push
	npx next dev

agent:
	cd agent && uvicorn main:app --port 8123 --reload

seed:
	npx prisma db push
	npx tsx prisma/seed.ts

test:
	cd agent && python -m pytest evals/ -v
