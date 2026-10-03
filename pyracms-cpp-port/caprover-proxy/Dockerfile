# CapRover app "pyracms": the stock reverse proxy, but it passes on the
# scheme captain-nginx saw instead of its own (always "http").
FROM caprover/nginx-reverse-proxy:1-ef5ffcb
COPY forwarded-proto.conf /etc/nginx/conf.d/00-forwarded-proto.conf
RUN sed -i 's/X-Forwarded-Proto \$scheme;/X-Forwarded-Proto $pyracms_forwarded_proto;/' \
      /etc/nginx/conf.d/default.conf \
 && grep -q 'pyracms_forwarded_proto' /etc/nginx/conf.d/default.conf
