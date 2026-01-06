# Starts dev electron app
devStart:
	npx electron .

# Bundles and watch for changes in the renderer process
devRenderer:
	cp src/renderer/public/* src/renderer/dist/ -r && \
	npx esbuild src/renderer/index.tsx \
	  --bundle \
	  --outfile=src/renderer/dist/bundle.js \
	  --jsx=automatic \
	  --minify \
	  --loader:.png=file \
	  --loader:.svg=file \
	  --asset-names=assets/[name]-[hash] \
	  --external:tiny-secp256k1 \
	  --external:bitcoinjs-lib \
	  --external:ecpair \
      --watch 

# Bundles and watch for changes in the main process
devMain:
	npx tsc -p ./src/main --watch

