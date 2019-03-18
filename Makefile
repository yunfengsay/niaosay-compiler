
npm = cnpm
node = ts-node
entrance = index.ts
install:
	cnpm i

start:
	$(node) $(entrance)

watch:
	nodemon --exec $(node) $(entrance)

t:
	$(npm) run test