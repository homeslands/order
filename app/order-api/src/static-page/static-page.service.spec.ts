import { Test, TestingModule } from "@nestjs/testing";
import { StaticPageService } from "./static-page.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { StaticPage } from "./static-page.entity";
import { MockType, repositoryMockFactory } from "src/test-utils/repository-mock.factory";
import { MAPPER_MODULE_PROVIDER } from "src/app/app.constants";
import { mapperMockFactory } from "src/test-utils/mapper-mock.factory";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Repository } from "typeorm";
import { Mapper } from "@automapper/core";
import { StaticPageException } from "./static-page.exception";
import { CreateStaticPageDto, UpdateStaticPageDto } from "./static-page.dto";
import { StaticPageValidation } from "./static-page.validation";

describe('StaticPageService', () => {
  let service: StaticPageService;
  let staticPageRepositoryMock: MockType<Repository<StaticPage>>;
  let mapperMock: MockType<Mapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaticPageService,
        {
          provide: getRepositoryToken(StaticPage),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<StaticPageService>(StaticPageService);
    staticPageRepositoryMock = module.get(getRepositoryToken(StaticPage));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if static page key already exist', async () => {
      const createStaticPage = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
      } as CreateStaticPageDto;
      const staticPage = {
        key: "",
        title: "",
        content: "",
        id: "",
        slug: "",
      } as StaticPage;
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(staticPage);
      await expect(service.create(staticPage)).rejects.toThrow(StaticPageException);
    });

    it('should create a static page success', async () => {
      const staticPage = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
      } as CreateStaticPageDto;
      const mockOutput = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
        id: "",
        slug: "",
      } as StaticPage;
      
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      (staticPageRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      const result = await service.create(staticPage);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('getByKey', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if static page not found', async () => {
      const key = 'ABOUT-US';
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.getByKey(key)).rejects.toThrow(StaticPageException);
    });

    it('should return static page success', async () => {
      const key = 'ABOUT-US';
      const mockOutput = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
        id: "",
        slug: "",
      } as StaticPage;
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      const result = await service.getByKey(key);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if static page not found', async () => {
      const slug = 'about-us-slug';
      const updateStaticPage = {
        title: 'About Us',
        content: 'This is about us',
      } as UpdateStaticPageDto;
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.update(slug, updateStaticPage)).rejects.toThrow(StaticPageException);
    });

    // it('should throw exception if service.validateUpdatedKey throws', async () => {
    //   const slug = 'about-us-slug';
    //   const updateStaticPage = {
    //     key: 'ABOUT-US',
    //     title: 'About Us',
    //     content: 'This is about us',
    //   } as UpdateStaticPageDto;
    //   const mockOutput = {
    //     key: 'ABOUT-US',
    //     title: 'About Us',
    //     content: 'This is about us',
    //     id: "",
    //     slug: "",
    //   } as StaticPage;
      
    //   (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(mockOutput);
    //   jest.spyOn(service, 'validateUpdatedKey').mockRejectedValue(
    //     new StaticPageException(StaticPageValidation.STATIC_PAGE_KEY_ALREADY_EXIST)
    //   );
    //   await expect(service.update(slug, updateStaticPage)).rejects.toThrow(StaticPageException);
    // });

    it('should update static page success', async () => {
      const slug = 'about-us-slug';
      const updateStaticPage = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
      } as UpdateStaticPageDto;
      const mockOutput = {
        key: 'ABOUT-US',
        title: 'About Us',
        content: 'This is about us',
        id: "",
        slug: "",
      } as StaticPage;
      (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(mockOutput);
      // jest.spyOn(service, 'validateUpdatedKey').mockResolvedValue();
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      (staticPageRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      const result = await service.update(slug, updateStaticPage);
      expect(result).toEqual(mockOutput);
    });
  });

  // describe('validateUpdatedKey', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should throw an error if static page key already exist', async () => {
  //     const staticPage = {
  //       key: 'ABOUT-US',
  //       title: 'About Us',
  //       content: 'This is about us',
  //       id: "",
  //       slug: "",
  //     } as StaticPage;
  //     const updateStaticPage = {
  //       key: 'UPDATED-ABOUT-US',
  //       title: 'About Us',
  //       content: 'This is about us',
  //     } as UpdateStaticPageDto;
  //     (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(staticPage);
  //     await expect(service.validateUpdatedKey(staticPage, updateStaticPage)).rejects.toThrow(StaticPageException);
  //   });
  // });

  // describe('remove', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should throw an error if static page not found', async () => {
  //     const slug = 'about-us-slug';
  //     (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(undefined);
  //     await expect(service.remove(slug)).rejects.toThrow(StaticPageException);
  //   });

  //   it('should remove static page success', async () => {
  //     const slug = 'about-us-slug';
  //     const mockOutput = {
  //       key: 'ABOUT-US',
  //       title: 'About Us',
  //       content: 'This is about us',
  //       id: "",
  //       slug: "",
  //     } as StaticPage;
  //     (staticPageRepositoryMock.findOne as jest.Mock).mockResolvedValue(mockOutput);
  //     (staticPageRepositoryMock.remove as jest.Mock).mockResolvedValue(mockOutput);
  //     (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);
  //     const result = await service.remove(slug);
  //     expect(result).toEqual(mockOutput);
  //   });
  // });
});