import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class GlobalMiddleware implements NestMiddleware {
  use (req: any, res: any, next: () => void) {
    if (String(req.headers.host).search('localhost') === -1) {
      if (String(req.headers.host).search('www') === -1) {
        res.redirect(req.protocol + '://www.' + req.headers.host);
      }
    }

    const DeviceDetector = require('node-device-detector');
    const DeviceHelper = require('node-device-detector/helper');
    const detector = new DeviceDetector();
    const result = detector.detect(
      req.headers['user-agent'] ??
      req.headers['User-agent'] ??
      req.headers['User-Agent'] ??
      req.headers['UserAgent'],
    );
    res.locals.isMobile = DeviceHelper.isMobile(result);
    res.locals.isDesktop = DeviceHelper.isDesktop(result);
    res.locals.title = 'Space Map';

    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    res.locals.title = 'App';
    res.locals.csrfTag =
      '<input type="hidden" id="_csrf" name="_csrf" value="' + token + '">';
    res.locals._csrf = token;
    if (req.session.errors) {
      res.locals.errors = req.session.errors;
      req.session.errors = null;
    } else {
      res.locals.errors = null;
    }

    res.locals.user = req.user;
    res.locals.env = process.env.ENV;
    res.locals.ssl = process.env.SSL;

    next();
  }
}
