FROM node:22-slim as build
WORKDIR /app

# 1. Declare the build argument
ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . ./

# 2. Create the runtime script file BEFORE building so Angular bundles it right
RUN mkdir -p src/assets && echo "window.__API_BASE_URL__ = '${API_BASE_URL}';" > src/assets/runtime-env.js

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist/rideshare-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]