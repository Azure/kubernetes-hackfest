FROM alpine

COPY src/requirements.txt /tmp/requirements.txt

RUN apk add --no-cache \
    python3 \
    nginx \
    uwsgi \
    uwsgi-python3 \
    supervisor && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    pip3 install -r /tmp/requirements.txt && \
    rm /etc/nginx/conf.d/default.conf && \
    rm -r /root/.cache

COPY nginx.conf /etc/nginx/

COPY flask-site-nginx.conf /etc/nginx/conf.d/

COPY uwsgi.ini /etc/uwsgi/

COPY supervisord.conf /etc/supervisord.conf

COPY ./src /app
WORKDIR /app

CMD ["/usr/bin/supervisord"]