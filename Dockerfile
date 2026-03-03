FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system barotw && \
  adduser --system -G barotw barotw

COPY dist/apps/api barotw/
COPY dist/apps/web/browser barotw/assets/
RUN chown -R barotw:barotw .

RUN npm --prefix barotw --omit=dev -f install

CMD [ "node", "barotw" ]
