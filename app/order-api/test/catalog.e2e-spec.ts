import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from 'src/catalog/catalog.service';
import { AppModule } from 'src/app/app.module';

describe('CatalogController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;
  // let catalogService: CatalogService;
  const getAllCatalogsData = [
    {
      slug: '123',
      name: 'Đồ ăn',
      description: 'Các loại đồ ăn',
    },
    {
      slug: '456',
      name: 'Nước uống',
      description: 'Các loại nước uống',
    },
  ];

  const createdCatalogData = {
    slug: '123',
    name: 'Đồ ăn',
    description: 'Các loại đồ ăn',
  };

  const updatedCatalogData = {
    slug: '123',
    name: 'Updated Catalog',
    description: 'Description of updated catalog',
  };

  // const deletedCatalogData: number = 1;
  const deletedCatalogData = { 1: 1 };

  const catalogService = {
    getAllCatalogs: () => getAllCatalogsData,
    createCatalog: () => createdCatalogData,
    updateCatalog: () => updatedCatalogData,
    deleteCatalog: () => deletedCatalogData,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // CatalogModule,
        AppModule,
      ],
    })
      .overrideProvider(CatalogService)
      .useValue(catalogService)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get<JwtService>(JwtService);
    await app.init();

    const payload = { sub: 1, username: 'johndoe' };
    authToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/catalogs (GET)', () => {
    return request(app.getHttpServer())
      .get('/catalogs')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect(getAllCatalogsData);
  });

  it('/catalogs (POST)', () => {
    return request(app.getHttpServer())
      .post('/catalogs')
      .send({
        name: 'Đồ ăn',
        description: 'Các loại đồ ăn',
      })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.CREATED)
      .expect(createdCatalogData);
  });

  it('/catalogs (PATCH)', () => {
    const slug = 'slug-123';
    const updateData = {
      name: 'Updated Variant Name',
      description: 'Updated Variant Description',
    };

    return request(app.getHttpServer())
      .patch(`/catalogs/${slug}`)
      .send(updateData)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect(updatedCatalogData);
  });

  it('/catalogs (DELETE)', () => {
    const slug = 'slug-123';

    return request(app.getHttpServer())
      .delete(`/catalogs/${slug}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect(deletedCatalogData);
  });
});
