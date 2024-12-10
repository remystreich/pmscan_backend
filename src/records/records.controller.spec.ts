import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRecordDto } from './dto/create-record.dto';
import { User, Record } from '@prisma/client';

describe('RecordsController', () => {
  let controller: RecordsController;
  let service: RecordsService;
  let mockUser: User;
  let mockRecord: Record;
  let mockCreateRecordDto: CreateRecordDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            create: jest.fn(),
            updateName: jest.fn(),
            remove: jest.fn(),
            findAllFromPmScan: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RecordsController>(RecordsController);
    service = module.get<RecordsService>(RecordsService);

    mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreateRecordDto = {
      data: 'base64encodedstring',
      name: 'Test Record',
    };

    mockRecord = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: Buffer.from(mockCreateRecordDto.data, 'base64'),
      name: mockCreateRecordDto.name,
      pmScanId: 1,
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a record', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockRecord);

      const result = await controller.create(
        mockCreateRecordDto,
        '1',
        mockUser,
      );

      expect(result).toEqual(mockRecord);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateRecordDto,
        1,
        mockUser.id,
      );
    });
  });

  describe('updateName', () => {
    it('should update the name of a record', async () => {
      const updatedRecord = { ...mockRecord, name: 'Updated Record Name' };
      jest.spyOn(service, 'updateName').mockResolvedValue(updatedRecord);

      const result = await controller.updateName(
        '1',
        { name: 'Updated Record Name' },
        mockUser,
      );

      expect(result).toEqual(updatedRecord);
      expect(service.updateName).toHaveBeenCalledWith(
        1,
        'Updated Record Name',
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should delete a record', async () => {
      const deleteResult = { message: 'Record deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteResult);

      const result = await controller.remove('1', mockUser);

      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should get all records from a pmscan', async () => {
      const mockPmScanId = '1';
      const mockPage = 1;
      const mockLimit = 10;
      const mockRecords = [
        { ...mockRecord, measuresCount: 50, data: undefined },
        { ...mockRecord, id: 2, measuresCount: 50, data: undefined },
      ];
      const mockResponse = {
        records: mockRecords,
        meta: {
          total: 2,
          page: mockPage,
          limit: mockLimit,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'findAllFromPmScan').mockResolvedValue(mockResponse);

      const result = await controller.findAllFromPmScan(
        mockPmScanId,
        mockUser,
        mockPage,
        mockLimit,
      );

      expect(result).toEqual(mockResponse);
      expect(service.findAllFromPmScan).toHaveBeenCalledWith(
        +mockPmScanId,
        mockUser.id,
        mockPage,
        mockLimit,
      );
    });
  });
});
