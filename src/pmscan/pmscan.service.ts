import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePmscanDto } from './dto/create-pmscan.dto';
import { UpdatePmscanDto } from './dto/update-pmscan.dto';
import { PmscanRepository } from './pmscan.repository';
import { UsersService } from '../users/users.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PmscanService {
  constructor(
    private readonly pmscanRepository: PmscanRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(createPmscanDto: CreatePmscanDto) {
    const user = await this.usersService.findOne(createPmscanDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.pmscanRepository.create({
      name: createPmscanDto.name,
      deviceId: createPmscanDto.deviceId,
      deviceName: createPmscanDto.deviceName,
      display: Buffer.from(createPmscanDto.display, 'base64'),
      user: { connect: { id: createPmscanDto.userId } },
    });
  }

  async findAllFromUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.pmscanRepository.findAllFromUser(userId);
  }

  async findOne(id: number) {
    const pmscan = await this.pmscanRepository.findOne(id);
    if (!pmscan) {
      throw new NotFoundException('PMScan not found');
    }
    return pmscan;
  }

  async update(id: number, updatePmscanDto: UpdatePmscanDto) {
    const existingPmscan = await this.pmscanRepository.findOne(id);
    if (!existingPmscan) {
      throw new NotFoundException('PMScan non trouvé');
    }

    const updateData: Prisma.PMScanUpdateInput = {};

    if (updatePmscanDto.name !== undefined) {
      updateData.name = updatePmscanDto.name;
    }
    if (updatePmscanDto.deviceId !== undefined) {
      updateData.deviceId = updatePmscanDto.deviceId;
    }
    if (updatePmscanDto.deviceName !== undefined) {
      updateData.deviceName = updatePmscanDto.deviceName;
    }
    if (updatePmscanDto.display !== undefined) {
      updateData.display = Buffer.from(updatePmscanDto.display, 'base64');
    }

    return this.pmscanRepository.update(id, updateData);
  }

  async remove(id: number) {
    await this.pmscanRepository.delete(id);
    return { message: 'PMScan supprimé avec succès' };
  }
}
