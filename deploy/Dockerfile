FROM ubuntu

RUN apt-get install -y curl 
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/www/sites

COPY ./package.tbz /tmp/package.tbz

RUN tar xjfv /tmp/package.tbz -C /var/www/sites
WORKDIR /var/www/sites/cms_map
RUN npm install --production

EXPOSE 8080

CMD npm start