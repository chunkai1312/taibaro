FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system twstock-barometer && \
  adduser --system -G twstock-barometer twstock-barometer

COPY dist/apps/api twstock-barometer/
COPY dist/apps/web/browser twstock-barometer/assets/
RUN chown -R twstock-barometer:twstock-barometer .

RUN npm --prefix twstock-barometer --omit=dev -f install

CMD [ "node", "twstock-barometer" ]
