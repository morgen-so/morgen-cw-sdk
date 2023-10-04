# Generate morgen client for OpenAPI spec of `morgen-backend`
npx openapi-typescript-codegen \
  --input ./openapi.v3.yaml \
  --output ./src/generated \
  --name Morgen \
  --client fetch \
  --useOptions \
  --request ./src/request.ts
