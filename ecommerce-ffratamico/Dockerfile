FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]



# FROM node:20-alpine AS development

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm ci

# COPY . .

# FROM node:20-alpine AS build

# WORKDIR /usr/src/app

# COPY package.json ./

# COPY package-lock.json ./

# COPY --from=development /usr/src/app/node_modules ./node_modules

# COPY . .

# RUN npm run build

# FROM node:20-alpine AS production

# WORKDIR /usr/src/app

# COPY --from=build  /usr/src/app/node_modules ./node_modules
# COPY --from=build /usr/src/app/dist ./dist 

# EXPOSE 3000

# CMD ["node", "dist/main.js"]
