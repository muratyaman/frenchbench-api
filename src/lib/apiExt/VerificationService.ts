import differenceInSeconds from 'date-fns/differenceInSeconds';
import * as _ from '../constants';
import * as at from '../apiTypes';
import * as dm from '../dbModels';
import { IDb } from '../db';
import { EmailService } from '../EmailService';
import { log, newUuid, rndEmailVerificationCode, validateEmailAddress } from '../utils';

export class VerificationService {

  constructor(
    private db: IDb,
    private emailMgr: EmailService,
  ) {

  }

  // TODO: captcha
  async verify_email_start({ user, input = { email: '' }}) {
    let data = null, error = null;
    const { email = '' } = input;
    while(!data) {
      if (!validateEmailAddress(email)) {
        error = 'invalid email address'; break;
      }
      const code = rndEmailVerificationCode();
      const id = newUuid();
      const row: dm.EmailVerification = { id, email, code, created_at: new Date(), used: 0 };
      const { result, error: insertErr } = await this.db.insert(_.TBL_EMAIL_VERIF, row);
      if (!result || insertErr) {
        log('db error in verify_email_start', insertErr);
        error = 'unexpected error'; break;
      }
      const msgObj = {
        to: email,
        subject: 'Email verification for FrenchBench.org',
        text: 'Please use this code to verify that you own the email address: ' + code,
        html: 'Please use this code to verify that you own the email address: ' + code, // TODO: beautiful email needed
      }
      const emailResult = await this.emailMgr.sendEmail(msgObj);
      if (emailResult && emailResult.messageId) {
        data = { id, message_id: emailResult.messageId };
      } else {
        error = 'failed to send email'; break;
      }
      break; // run once
    }
    return { data, error };
  }

  async verify_email_finish({ user, input = { email: '', code: '' }}) {
    let data = null, error = null, found = false;
    const { email = '', code = '' } = input;
    while (!found) {
      if (!validateEmailAddress(email)) {
        error = 'invalid email address or code'; break;
      }
      const { result, error: findErr } = await this.db.find<dm.EmailVerification>(_.TBL_EMAIL_VERIF, { email, code, used: 0 });
      if (!result || findErr) {
        log('db error in verify_email_finish', findErr);
        error = 'unexpected error'; break;
      }
      const { rows = [] } = result;
      const now = new Date();
      for (const row of rows) {
        const delta = differenceInSeconds(now, row.created_at);
        if (delta < 10 * 60) { // ok, within 10 minutes, not expired
          found = true;
          break;
        }
      }
      if (!found) {
        error = 'invalid email address or code'; // no clues for hackers ;)
        break;
      }
      // save verified email address in db
      const change = { email, email_verified: 1 };
      const { result: resultUpdate, error: updateErr } = await this.db.update(_.TBL_USER, { id: user.id }, change);
      if (!resultUpdate || updateErr) {
        log('db error in verify_email_finish', findErr);
        error = 'unexpected error';
        break;
      }
      data = { success: true };
      break; // run once
    }
    return { data, error };
  }

  _api() {
    return {
      verify_email_start: this.verify_email_start,
      verify_email_finish: this.verify_email_finish,
    };
  }
}
