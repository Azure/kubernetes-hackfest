FROM alpine

COPY src/requirements.txt /tmp/requirements.txt

RUN apk add --no-cache \
    python3 && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    pip3 install -r /tmp/requirements.txt && \ 
    rm -r /root/.cache

COPY ./src /app
WORKDIR /app

CMD ["python3", "job.py"]