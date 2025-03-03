import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { resolve } from 'path';
import { User } from 'src/user/user.entity';
import { MailProducer } from './mail.producer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailProducer: MailProducer,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async sendForgotPasswordToken(user: User, url: string) {
    const context = `${MailService.name}.${this.sendForgotPasswordToken.name}`;
    await this.mailProducer.sendMail({
      to: user.email, // list of receivers
      subject: 'Reset Password', // Subject line
      template: resolve('public/templates/mail/forgot-password'), // `.ejs` extension is appended automatically
      context: {
        name: `${user.firstName} ${user.lastName}`,
        url,
      },
    });
    this.logger.log(`Email is sending to ${user.email}`, context);
  }

  async sendNewPassword(user: User, newPassword: string) {
    const context = `${MailService.name}.${this.sendNewPassword.name}`;
    try {
      await this.mailProducer.sendMail({
        to: user.email, // list of receivers
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Reset Password', // Subject line
        template: resolve('public/templates/mail/reset-password'), // `.ejs` extension is appended automatically
        context: {
          name: `${user.firstName} ${user.lastName}`,
          newPassword,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error sending email to ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BadRequestException(`Error sending email to ${user.email}`);
    }
    this.logger.log(`Email sent to ${user.email}`, context);
  }

  async sendVerifyEmail(user: User, url: string, email: string) {
    const context = `${MailService.name}.${this.sendVerifyEmail.name}`;
    await this.mailProducer.sendMail({
      to: email,
      subject: 'Verify Email',
      template: resolve('public/templates/mail/verify-email'),
      context: {
        name: `${user.firstName} ${user.lastName}`,
        url,
      },
    });
    this.logger.log(`Email is sending to ${email}`, context);
  }

  // async sendInvoiceWhenOrderPaid(user: User, orderSlug: string) {
  //   const context = `${MailService.name}.${this.sendInvoiceWhenOrderPaid.name}`;

  //   this.logger.log(orderSlug, context);
  //   await this.mailProducer.sendMail({
  //     // to: user.email,
  //     to: 'cr7ronadol12345@gmail.com',
  //     subject: 'Send Invoice',
  //     template: resolve('public/templates/invoice'),
  //     context: {
  //       // name: `${user.firstName} ${user.lastName}`,
  //       // url,
  //       logoString: 'BASE64_ENCODED_IMAGE_STRING',
  //       branchAddress: '123 Đường ABC, TP.HCM',
  //       qrcode:
  //         'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com',
  //       createdAt: new Date(),
  //       tableName: 'Bàn 5',
  //       customer: 'Nguyễn Văn A',
  //       cashier: 'Trần Thị B',
  //       invoiceItems: [
  //         {
  //           productName: 'Trà Sữa Trân Châu',
  //           size: 'L',
  //           quantity: 2,
  //           price: 50000,
  //           total: 100000,
  //         },
  //         {
  //           productName: 'Cà Phê Đen',
  //           size: 'M',
  //           quantity: 1,
  //           price: 30000,
  //           total: 30000,
  //         },
  //       ],
  //       paymentMethod: 'Tiền mặt',
  //       amount: 130000,
  //       formatCurrency: (amount) => `${amount.toLocaleString('vi-VN')}₫`,
  //       formatDate: (date, format) => date.toLocaleString('vi-VN'),
  //       formatPaymentMethod: (method) => method,
  //     },
  //   });
  //   this.logger.log(`Invoice is sending to ${user.email}`, context);
  //   if (user.email && user.isVerifiedEmail) {
  //     // await this.mailProducer.sendMail({
  //     //   // to: user.email,
  //     //   to: 'huuthietn01@gmail.com',
  //     //   subject: 'Send Invoice',
  //     //   template: resolve('public/templates/invoice'),
  //     //   context: {
  //     //     // name: `${user.firstName} ${user.lastName}`,
  //     //     // url,
  //     //     logoString: 'BASE64_ENCODED_IMAGE_STRING',
  //     //     branchAddress: '123 Đường ABC, TP.HCM',
  //     //     qrcode:
  //     //       'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com',
  //     //     createdAt: new Date(),
  //     //     tableName: 'Bàn 5',
  //     //     customer: 'Nguyễn Văn A',
  //     //     cashier: 'Trần Thị B',
  //     //     invoiceItems: [
  //     //       {
  //     //         productName: 'Trà Sữa Trân Châu',
  //     //         size: 'L',
  //     //         quantity: 2,
  //     //         price: 50000,
  //     //         total: 100000,
  //     //       },
  //     //       {
  //     //         productName: 'Cà Phê Đen',
  //     //         size: 'M',
  //     //         quantity: 1,
  //     //         price: 30000,
  //     //         total: 30000,
  //     //       },
  //     //     ],
  //     //     paymentMethod: 'Tiền mặt',
  //     //     amount: 130000,
  //     //     formatCurrency: (amount) => `${amount.toLocaleString('vi-VN')}₫`,
  //     //     formatDate: (date, format) => date.toLocaleString('vi-VN'),
  //     //     formatPaymentMethod: (method) => method,
  //     //   },
  //     // });
  //     // this.logger.log(`Invoice is sending to ${user.email}`, context);
  //   }
  // }
}
