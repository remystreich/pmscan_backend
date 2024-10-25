import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(from: string, to: string, subject: string, text: string) {
    this.transporter.sendMail(
      {
        from: from,
        to: to,
        subject: subject,
        text: text,
      },
      (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      },
    );
  }
}
