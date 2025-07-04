import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { formatCurrency, formatDate, formatPaymentMethod } from 'src/helper';
import * as ejs from 'ejs';
import * as _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class PdfService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  private async compileTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    const context = `${PdfService.name}.${this.compileTemplate.name}`;
    const templatePath = path.resolve(
      'public/templates',
      `${templateName}.ejs`,
    );
    if (!fs.existsSync(templatePath)) {
      throw new BadRequestException(
        `Template ${templateName} not found at ${templatePath}`,
      );
    }
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    try {
      const template = ejs.render(templateSource, {
        ...data,
        formatCurrency,
        formatDate,
        formatPaymentMethod,
        reslove: path.resolve,
      });
      return template;
    } catch (error) {
      this.logger.error(
        `Error when rendering template: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BadRequestException(
        `Error when rendering template: ${error.message}`,
      );
    }
  }

  public async generatePdf(
    templateName: string,
    data: any,
    metadata?: puppeteer.PDFOptions,
  ): Promise<Buffer> {
    // Compile HTML using the specified template and data
    const htmlContent = await this.compileTemplate(templateName, data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    if (_.isEmpty(metadata)) metadata.format = 'A4';

    const pdfBuffer = await page.pdf({
      printBackground: true,
      ...metadata,
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  public async generatePdfImage(
    templateName: string,
    data: any,
    metadata?: puppeteer.ScreenshotOptions,
  ): Promise<Buffer> {
    // Compile HTML using the specified template and data
    const htmlContent = await this.compileTemplate(templateName, data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setViewport({
      width: 600,
      height: 384,
      deviceScaleFactor: 1,
    });

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    if (_.isEmpty(metadata)) metadata.type = 'png';

    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      // clip: {
      //   x: 0,
      //   y: 0,
      //   width: 576,
      //   height: 384,
      // },
      ...metadata,
    });

    await browser.close();

    return Buffer.from(screenshotBuffer);
  }
}
