import { Inject, Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { StaticPage } from './static-page.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StaticPageScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(StaticPage)
    private readonly staticPageRepository: Repository<StaticPage>,
  ) {}

  @Timeout(5000)
  async generateStaticPages() {
    const context = `${StaticPageScheduler.name}.${this.generateStaticPages.name}`;
    this.logger.log(`Generating static page`, context);

    // about us
    if (!(await this.isExistingStaticPage('ABOUT-US'))) {
      this.generateStaticPage('ABOUT-US', 'About Us', 'About us content');
    }

    // policy
    if (!(await this.isExistingStaticPage('POLICY'))) {
      this.generateStaticPage('POLICY', 'Policy', 'Policy content');
    }
  }

  async generateStaticPage(key: string, title: string, content: string) {
    const context = `${StaticPageScheduler.name}.${this.generateStaticPage.name}`;

    try {
      const staticPage = new StaticPage();
      Object.assign(staticPage, { key, title, content });
      const createdStaticPage = this.staticPageRepository.create(staticPage);
      await this.staticPageRepository.save(createdStaticPage);
      this.logger.log(`Static page ${key} generated`, context);
    } catch (error) {
      this.logger.error(
        `Error generating static page key: ${key}`,
        error.stack,
        context,
      );
    }
  }

  async isExistingStaticPage(key: string): Promise<boolean> {
    const context = `${StaticPageScheduler.name}.${this.isExistingStaticPage.name}`;

    const existingStaticPage = await this.staticPageRepository.findOne({
      where: {
        key,
      },
    });

    if (existingStaticPage) {
      this.logger.warn(`Static page with key ${key} already exist`, context);
      return true;
    }
    return false;
  }
}
