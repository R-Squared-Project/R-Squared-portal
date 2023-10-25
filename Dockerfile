FROM node:16.17 AS build

RUN yarn global add cross-env

CMD mkdir /rsquared-portal
WORKDIR /rsquared-portal

ADD package.json ./
ADD yarn.lock ./
ADD charting_library ./charting_library
RUN cross-env yarn install

ADD . .
RUN yarn build

FROM nginx:1.19 as run

COPY --from=build /rsquared-portal/build/dist /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/nginx.conf
