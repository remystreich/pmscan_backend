import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';
import { RecordsRepository } from './records.repository';
import { PmscanService } from '../pmscan/pmscan.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RecordsService', () => {
  let service: RecordsService;
  let recordsRepository: jest.Mocked<RecordsRepository>;
  let pmscanService: jest.Mocked<PmscanService>;

  const testUserId = 1;
  const testPmScanId = 1;
  const testRecordId = 1;

  const createTestRecord = (id = testRecordId, pmScanId = testPmScanId) => ({
    id,
    data: Buffer.from('test'),
    pmScanId,
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'online',
  });

  const createTestPmScan = (userId = testUserId) => ({
    id: testPmScanId,
    name: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    deviceId: 'device123',
    deviceName: 'TestDevice',
    display: Buffer.from('test'),
    userId,
  });

  beforeEach(async () => {
    const mockRecordsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllFromPmScan: jest.fn(),
    };

    const mockPmscanService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        { provide: RecordsRepository, useValue: mockRecordsRepository },
        { provide: PmscanService, useValue: mockPmscanService },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    recordsRepository = module.get(RecordsRepository);
    pmscanService = module.get(PmscanService);

    // Configurer les mocks par défaut
    recordsRepository.findOne.mockResolvedValue(createTestRecord());
    pmscanService.findOne.mockResolvedValue(createTestPmScan());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a record', async () => {
      const createRecordDto = {
        data: 'dGVzdA==',
        name: 'Test Record',
        type: 'online',
      };
      const pmScanId = 1;
      const userId = 1;
      const testPmScan = createTestPmScan(userId);
      const expectedRecord = {
        id: 1,
        data: Buffer.from('test'),
        pmScanId,
        name: 'Test Record',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'online',
      };

      pmscanService.findOne.mockResolvedValue(testPmScan);
      recordsRepository.create.mockResolvedValue(expectedRecord);

      const result = await service.create(createRecordDto, pmScanId, userId);

      expect(pmscanService.findOne).toHaveBeenCalledWith(pmScanId, userId);
      expect(recordsRepository.create).toHaveBeenCalledWith({
        data: Buffer.from('test'),
        name: 'Test Record',
        pmScan: { connect: { id: pmScanId } },
      });
      expect(result).toEqual(expectedRecord);
    });
  });

  describe('updateName', () => {
    it('should update record name', async () => {
      const name = 'New Name';
      const updatedRecord = { ...createTestRecord(), name };
      recordsRepository.update.mockResolvedValue(updatedRecord);

      const result = await service.updateName(testRecordId, name, testUserId);

      expect(recordsRepository.findOne).toHaveBeenCalledWith(testRecordId);
      expect(pmscanService.findOne).toHaveBeenCalledWith(
        testPmScanId,
        testUserId,
      );
      expect(recordsRepository.update).toHaveBeenCalledWith(testRecordId, {
        name: 'New Name',
      });
      expect(result).toEqual(updatedRecord);
    });

    it('should throw NotFoundException if record not found', async () => {
      recordsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateName(testRecordId, 'New Name', testUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the record', async () => {
      pmscanService.findOne.mockResolvedValue(null);

      await expect(
        service.updateName(testRecordId, 'New Name', testUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a record', async () => {
      const testRecord = createTestRecord();
      recordsRepository.delete.mockResolvedValue(testRecord);

      const result = await service.remove(testRecordId, testUserId);

      expect(recordsRepository.findOne).toHaveBeenCalledWith(testRecordId);
      expect(pmscanService.findOne).toHaveBeenCalledWith(
        testPmScanId,
        testUserId,
      );
      expect(recordsRepository.delete).toHaveBeenCalledWith(testRecordId);
      expect(result).toEqual({ message: 'Record deleted successfully' });
    });

    it('should throw NotFoundException if record not found', async () => {
      recordsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(testRecordId, testUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the record', async () => {
      pmscanService.findOne.mockResolvedValue(null);

      await expect(service.remove(testRecordId, testUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAllFromPMScan', () => {
    it('should return paginated records from a pmscan', async () => {
      const expectedRecords = [
        { ...createTestRecord(), measuresCount: 50, data: undefined },
        { ...createTestRecord(), measuresCount: 50, data: undefined },
      ];
      const totalRecords = 10;
      recordsRepository.findAllFromPmScan.mockResolvedValue({
        records: expectedRecords,
        total: totalRecords,
      });

      const page = 1;
      const limit = 2;
      const result = await service.findAllFromPmScan(
        testPmScanId,
        testUserId,
        page,
        limit,
      );

      expect(pmscanService.findOne).toHaveBeenCalledWith(
        testPmScanId,
        testUserId,
      );
      expect(recordsRepository.findAllFromPmScan).toHaveBeenCalledWith(
        testPmScanId,
        0, // skip
        limit,
      );
      expect(result).toEqual({
        records: expectedRecords,
        meta: {
          total: totalRecords,
          page,
          limit,
          totalPages: 5,
        },
      });
    });

    it('should use default values for page and limit if not provided', async () => {
      recordsRepository.findAllFromPmScan.mockResolvedValue({
        records: [],
        total: 0,
      });

      await service.findAllFromPmScan(testPmScanId, testUserId);

      expect(recordsRepository.findAllFromPmScan).toHaveBeenCalledWith(
        testPmScanId,
        0, // skip (page 1)
        10, // default limit
      );
    });

    it('should throw ForbiddenException if user does not own the pmscan', async () => {
      pmscanService.findOne.mockResolvedValue(null);

      await expect(
        service.findAllFromPmScan(testPmScanId, testUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
