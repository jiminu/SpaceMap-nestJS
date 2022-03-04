import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as passport from 'passport';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as csrf from 'csurf';
import * as fs from 'fs';
import hbs = require('hbs');
import { cozyLog } from './helpers/debug';

declare const module: any;

async function bootstrap () {
  const MySQLStore = require('express-mysql-session')(session);
  const sessionStore = new MySQLStore({
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT),
    user: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
  });

  let httpsOptions = {};
  if (process.env?.SSL === 'true') {
    httpsOptions = {
      key: fs.readFileSync(process.env?.SSL_KEY),
      cert: fs.readFileSync(process.env?.SSL_CERT),
    };
  }

  const app =
    process.env.SSL === 'true'
      ? await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions,
      })
      : await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      store: sessionStore,
      saveUninitialized: false,
    }),
  );

  // CORS
  app.enableCors();

  // Helmet
  const cspOptions = {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),

      // jQuery
      'script-src': ['\'self\'', '*.jquery.com', '\'unsafe-inline\''],
    },
  };
  app.use(helmet({ contentSecurityPolicy: false }));

  // Body Parser
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  app.use(bodyParser.json({ limit: '50mb' }));

  // Cookie Parser
  app.use(cookieParser());

  // CSRF
  app.use(csrf({ cookie: true }));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport session
  passport.serializeUser(function (user, done) {
    // console.log('passport session save: ', user);
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    // console.log('passport session get id: ', user);
    done(null, user);
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/default.hbs' });

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  hbs.registerHelper('isEqual', function (value1, value2) {
    return value1 == value2;
  });
  hbs.registerHelper(
    'itemNumber',
    function (totalCount, currentPage, itemsPerPage, itemCount, index) {
      return totalCount - (currentPage - 1) * itemsPerPage - index;
    },
  );
  hbs.registerHelper('times', function (n, block) {
    let accum = '';
    for (let i = 0; i < n; i++) accum += block.fn(i);
    return accum;
  });
  hbs.registerHelper('for', function (start, end, block) {
    let accum = '';
    for (let i = start; i < end; i++) accum += block.fn(i);
    return accum;
  });
  hbs.registerHelper('pageLink', function (route: string, page: string) {
    if (String(route).search(/\?/) === -1) {
      return route + '?page=' + page;
    } else {
      return route + '&page=' + page;
    }
  });
  hbs.registerHelper('intCompare', function (a, operator, b) {
    switch (operator) {
      case '==':
        return a == b;
      case '>':
        return a > b;
      case '>=':
        return a >= b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
      default:
        return a == b;
    }
  });
  hbs.registerHelper('time', function () {
    return (Date.now() / 1000) | 0;
  });
  hbs.registerHelper('JsonToString', function (data) {
    return JSON.stringify(data);
  });
  hbs.registerHelper('dateFormat', function (date: Date, format: string) {
    if (!format) format = 'MM/dd/yyyy';

    if (!date) return '';

    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    format = format.replace('MM', month.toString().padStart(2, '0'));

    if (format.indexOf('yyyy') > -1)
      format = format.replace('yyyy', year.toString());
    else if (format.indexOf('yy') > -1)
      format = format.replace('yy', year.toString().substr(2, 2));

    format = format.replace('dd', date.getDate().toString().padStart(2, '0'));

    var hours = date.getHours();
    if (format.indexOf('t') > -1) {
      if (hours > 11) format = format.replace('t', 'pm');
      else format = format.replace('t', 'am');
    }
    if (format.indexOf('HH') > -1)
      format = format.replace('HH', hours.toString().padStart(2, '0'));
    if (format.indexOf('hh') > -1) {
      if (hours > 12) hours -= 12;
      if (hours == 0) hours = 12;
      format = format.replace('hh', hours.toString().padStart(2, '0'));
    }
    if (format.indexOf('mm') > -1)
      format = format.replace(
        'mm',
        date.getMinutes().toString().padStart(2, '0'),
      );
    if (format.indexOf('ss') > -1)
      format = format.replace(
        'ss',
        date.getSeconds().toString().padStart(2, '0'),
      );
    return format;
  });
  hbs.registerHelper('Array', function (count: number) {
    return [...Array(count).keys()];
  });
  hbs.registerHelper('sum', (...numbers) =>
    parseInt(numbers.reduce((sum, value) => sum + value, 0)),
  );
  hbs.registerHelper('sub', (a, b) => a - b);

  await app.listen(process.env.PORT);

  if (module.hot) {
    const connection = getConnection();
    if (connection.isConnected) {
      await connection.close();
    }
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
